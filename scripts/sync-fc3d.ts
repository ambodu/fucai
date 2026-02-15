/**
 * FC3D Data Sync Script
 *
 * Downloads lottery draw data from cwl.gov.cn (China Welfare Lottery official API)
 * and saves to local JSON files.
 *
 * Usage:
 *   npx tsx scripts/sync-fc3d.ts --full    # Full history download (2004-present)
 *   npx tsx scripts/sync-fc3d.ts            # Incremental sync (last 30 days)
 *
 * Data source:
 *   cwl.gov.cn JSON API (requires cookie handshake)
 *   API: /cwl_admin/front/cwlkj/search/kjxx/findDrawNotice
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { IncomingMessage } from 'http';

// --- Types ---

interface RawDraw {
  period: string;
  date: string;
  digit1: number;
  digit2: number;
  digit3: number;
}

interface DataFile {
  lastUpdated: string;
  totalCount: number;
  draws: RawDraw[];
}

interface SyncLog {
  lastSync: string;
  status: 'success' | 'error';
  newDraws: number;
  totalDraws: number;
  message: string;
}

interface HttpResponse {
  statusCode: number;
  headers: IncomingMessage['headers'];
  body: string;
}

// --- Config ---

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'fc3d-history.json');
const LATEST_FILE = path.join(DATA_DIR, 'fc3d-latest.json');
const SYNC_LOG_FILE = path.join(DATA_DIR, 'sync-log.json');

const LATEST_COUNT = 200;
const REQUEST_DELAY_MS = 1500;
const CWL_API_BASE = 'https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice';

// --- Utility Functions ---

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Low-level HTTPS GET that returns status, headers, and body
 * without following redirects (so we can capture Set-Cookie).
 */
function rawHttpsGet(url: string, headers: Record<string, string> = {}): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf-8'),
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error(`Request timeout: ${url}`));
    });
  });
}

// --- Cookie-based CWL API Client ---

let cachedCookie = '';

const CWL_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Referer': 'https://www.cwl.gov.cn/ygkj/wqkjgg/3d/',
  'X-Requested-With': 'XMLHttpRequest',
};

/**
 * Obtain session cookie from cwl.gov.cn.
 * The server returns a 302 with Set-Cookie on first request.
 * We capture the cookie and use it for subsequent requests.
 */
async function getCwlCookie(): Promise<string> {
  if (cachedCookie) return cachedCookie;

  const url = `${CWL_API_BASE}?name=3d&dayStart=2025-01-01&dayEnd=2025-01-02&pageNo=1&pageSize=1&systemType=PC`;
  const resp = await rawHttpsGet(url, CWL_HEADERS);

  if (resp.headers['set-cookie']) {
    const cookies = resp.headers['set-cookie'];
    cachedCookie = (Array.isArray(cookies) ? cookies : [cookies])
      .map(c => c.split(';')[0])
      .join('; ');
    console.log('  Cookie obtained successfully');
  }

  // Sometimes server issues multiple redirects, retry once
  if (!cachedCookie) {
    await sleep(1000);
    const resp2 = await rawHttpsGet(url, CWL_HEADERS);
    if (resp2.headers['set-cookie']) {
      const cookies = resp2.headers['set-cookie'];
      cachedCookie = (Array.isArray(cookies) ? cookies : [cookies])
        .map(c => c.split(';')[0])
        .join('; ');
    }
  }

  return cachedCookie;
}

/**
 * Make an authenticated GET request to cwl.gov.cn API.
 * Handles the cookie handshake automatically.
 */
async function cwlGet(url: string): Promise<string> {
  const cookie = await getCwlCookie();

  const headers = {
    ...CWL_HEADERS,
    ...(cookie ? { 'Cookie': cookie } : {}),
  };

  const resp = await rawHttpsGet(url, headers);

  // If we get another 302, refresh cookie and retry
  if (resp.statusCode === 302) {
    cachedCookie = '';
    if (resp.headers['set-cookie']) {
      const cookies = resp.headers['set-cookie'];
      cachedCookie = (Array.isArray(cookies) ? cookies : [cookies])
        .map(c => c.split(';')[0])
        .join('; ');
    } else {
      await getCwlCookie();
    }

    const retryHeaders = {
      ...CWL_HEADERS,
      'Cookie': cachedCookie,
    };
    const resp2 = await rawHttpsGet(url, retryHeaders);
    if (resp2.statusCode !== 200) {
      throw new Error(`CWL API returned ${resp2.statusCode} after cookie refresh`);
    }
    return resp2.body;
  }

  if (resp.statusCode !== 200) {
    throw new Error(`CWL API returned ${resp.statusCode}`);
  }

  return resp.body;
}

// --- Data Functions ---

function loadExistingData(): DataFile {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(content) as DataFile;
    } catch {
      console.warn('Failed to load existing history file, starting fresh');
    }
  }
  return { lastUpdated: '', totalCount: 0, draws: [] };
}

function saveData(data: DataFile): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Save full history (compact JSON to minimize file size)
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data), 'utf-8');
  const historySize = (fs.statSync(HISTORY_FILE).size / 1024).toFixed(1);
  console.log(`  Saved ${data.totalCount} draws to fc3d-history.json (${historySize} KB)`);

  // Save latest subset (pretty JSON for readability)
  const latestData: DataFile = {
    lastUpdated: data.lastUpdated,
    totalCount: Math.min(data.draws.length, LATEST_COUNT),
    draws: data.draws.slice(0, LATEST_COUNT),
  };
  fs.writeFileSync(LATEST_FILE, JSON.stringify(latestData, null, 2), 'utf-8');
  const latestSize = (fs.statSync(LATEST_FILE).size / 1024).toFixed(1);
  console.log(`  Saved ${latestData.totalCount} recent draws to fc3d-latest.json (${latestSize} KB)`);
}

function saveSyncLog(log: SyncLog): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(SYNC_LOG_FILE, JSON.stringify(log, null, 2), 'utf-8');
}

function mergeDraws(existing: RawDraw[], incoming: RawDraw[]): RawDraw[] {
  const map = new Map<string, RawDraw>();
  for (const d of existing) map.set(d.period, d);
  for (const d of incoming) map.set(d.period, d);

  return Array.from(map.values()).sort((a, b) => b.period.localeCompare(a.period));
}

// --- cwl.gov.cn API ---

function parseCwlDate(dateStr: string): string {
  // CWL date format: "2025-02-15(六)" -> "2025-02-15"
  return (dateStr || '').replace(/\([^)]*\)/, '').trim().slice(0, 10);
}

async function fetchFromCwl(dayStart: string, dayEnd: string): Promise<RawDraw[]> {
  const draws: RawDraw[] = [];
  let pageNo = 1;
  const pageSize = 100;

  while (true) {
    const url = `${CWL_API_BASE}?name=3d&dayStart=${dayStart}&dayEnd=${dayEnd}&pageNo=${pageNo}&pageSize=${pageSize}&systemType=PC`;
    console.log(`  Page ${pageNo}: ${dayStart} ~ ${dayEnd}`);

    try {
      const text = await cwlGet(url);

      let json: { state: number; result: Array<{ code: string; date: string; red: string }> };
      try {
        json = JSON.parse(text);
      } catch {
        console.warn(`    Failed to parse JSON response (length=${text.length})`);
        console.warn(`    Response preview: ${text.substring(0, 200)}`);
        break;
      }

      if (json.state !== 0 || !json.result || json.result.length === 0) {
        if (json.state !== 0) {
          console.warn(`    API state: ${json.state}`);
        }
        break;
      }

      for (const item of json.result) {
        if (!item.code || !item.red) continue;
        const numbers = item.red.split(',').map((n: string) => parseInt(n.trim(), 10));
        if (numbers.length !== 3 || numbers.some((n: number) => isNaN(n) || n < 0 || n > 9)) continue;
        draws.push({
          period: item.code,
          date: parseCwlDate(item.date),
          digit1: numbers[0],
          digit2: numbers[1],
          digit3: numbers[2],
        });
      }

      console.log(`    Got ${json.result.length} draws (total: ${draws.length})`);
      if (json.result.length < pageSize) break;
      pageNo++;
      await sleep(REQUEST_DELAY_MS);
    } catch (error) {
      console.error(`    Error: ${error instanceof Error ? error.message : error}`);
      break;
    }
  }

  return draws;
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const isFull = args.includes('--full');

  console.log('=== FC3D Data Sync ===');
  console.log(`Mode: ${isFull ? 'FULL HISTORY' : 'INCREMENTAL'}`);
  console.log(`Source: cwl.gov.cn`);
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    const existing = loadExistingData();
    console.log(`Existing data: ${existing.totalCount} draws`);

    // Obtain cookie first
    console.log('\nObtaining session cookie...');
    await getCwlCookie();
    if (!cachedCookie) {
      throw new Error('Failed to obtain session cookie from cwl.gov.cn');
    }

    let incoming: RawDraw[];

    if (isFull) {
      // Full history: 2004 to present, fetch by year
      incoming = [];
      const currentYear = new Date().getFullYear();

      console.log(`\nDownloading full history (2004-${currentYear})...\n`);

      for (let year = currentYear; year >= 2004; year--) {
        console.log(`[${year}]`);
        const yearDraws = await fetchFromCwl(`${year}-01-01`, `${year}-12-31`);
        incoming.push(...yearDraws);
        console.log(`  Year ${year}: ${yearDraws.length} draws\n`);

        if (year > 2004) {
          await sleep(REQUEST_DELAY_MS);
        }
      }
    } else {
      // Incremental: last 30 days
      const now = new Date();
      const ago = new Date(now);
      ago.setDate(ago.getDate() - 30);

      console.log('\nIncremental sync (last 30 days)...\n');
      incoming = await fetchFromCwl(
        ago.toISOString().slice(0, 10),
        now.toISOString().slice(0, 10)
      );
    }

    console.log(`\nFetched ${incoming.length} draws from API`);

    if (incoming.length === 0) {
      console.log('No new data received. Keeping existing data.');
      saveSyncLog({
        lastSync: new Date().toISOString(),
        status: 'success',
        newDraws: 0,
        totalDraws: existing.totalCount,
        message: 'No new data from API',
      });
      return;
    }

    // Merge
    const merged = mergeDraws(existing.draws, incoming);
    const newCount = merged.length - existing.draws.length;

    console.log(`Merged: ${merged.length} total draws (${newCount > 0 ? '+' + newCount : '0'} new)`);

    if (merged.length > 0) {
      const newest = merged[0];
      const oldest = merged[merged.length - 1];
      console.log(`Range: ${oldest.period} (${oldest.date}) → ${newest.period} (${newest.date})`);
    }

    // Save
    const dataFile: DataFile = {
      lastUpdated: new Date().toISOString(),
      totalCount: merged.length,
      draws: merged,
    };

    saveData(dataFile);

    saveSyncLog({
      lastSync: new Date().toISOString(),
      status: 'success',
      newDraws: Math.max(0, newCount),
      totalDraws: merged.length,
      message: `Synced ${incoming.length} draws, ${newCount > 0 ? newCount + ' new' : 'no new'} draws added`,
    });

    console.log('\n=== Sync Complete ===');

  } catch (error) {
    console.error('\n=== Sync Failed ===');
    console.error(error);

    saveSyncLog({
      lastSync: new Date().toISOString(),
      status: 'error',
      newDraws: 0,
      totalDraws: loadExistingData().totalCount,
      message: error instanceof Error ? error.message : String(error),
    });

    process.exit(1);
  }
}

main();
