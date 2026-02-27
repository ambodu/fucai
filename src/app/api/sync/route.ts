import { NextRequest, NextResponse } from 'next/server';
import { syncConfig } from '@/lib/config';

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    const { timingSafeEqual } = require('crypto') as typeof import('crypto');
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    // fallback: constant-time-ish comparison
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

/**
 * POST /api/sync
 *
 * Trigger incremental data sync.
 * Protected by SYNC_SECRET to prevent unauthorized access.
 *
 * Usage:
 *   curl -X POST https://your-domain.com/api/sync?secret=xxx
 *   curl -X POST https://your-domain.com/api/sync -H "Authorization: Bearer xxx"
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  const secret = request.nextUrl.searchParams.get('secret')
    || request.headers.get('authorization')?.replace('Bearer ', '');

  if (!syncConfig.secret) {
    return NextResponse.json(
      { error: 'SYNC_SECRET not configured on server' },
      { status: 500 }
    );
  }

  if (!secret || !safeCompare(secret, syncConfig.secret)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // dynamic import — 在 Node.js 运行时可用，Edge/Workers 中不可用
  let execSyncFn: typeof import('child_process').execSync;
  try {
    const cp = await import('child_process');
    execSyncFn = cp.execSync;
  } catch {
    return NextResponse.json(
      { error: '当前运行环境不支持 sync 功能（需要 Node.js 运行时）' },
      { status: 501 }
    );
  }

  try {
    // Run sync script
    const output = execSyncFn('npx tsx scripts/sync-fc3d.ts', {
      cwd: process.cwd(),
      timeout: 120000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Read sync log for result
    const fs = await import('fs');
    const path = await import('path');
    const logPath = path.resolve(process.cwd(), 'data/sync-log.json');

    let syncLog = null;
    if (fs.existsSync(logPath)) {
      syncLog = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    }

    return NextResponse.json({
      success: true,
      log: syncLog,
      output: output.split('\n').slice(-10).join('\n'),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Sync failed', message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync
 *
 * Check sync status (last sync time, draw count).
 */
export async function GET() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const logPath = path.resolve(process.cwd(), 'data/sync-log.json');

    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ status: 'never_synced' });
    }

    const syncLog = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    return NextResponse.json(syncLog);
  } catch {
    return NextResponse.json(
      { error: 'Failed to read sync status' },
      { status: 500 }
    );
  }
}
