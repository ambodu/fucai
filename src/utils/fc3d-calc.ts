export function calcSum(d1: number, d2: number, d3: number): number {
  return d1 + d2 + d3;
}

export function calcSpan(d1: number, d2: number, d3: number): number {
  return Math.max(d1, d2, d3) - Math.min(d1, d2, d3);
}

export function getGroupType(d1: number, d2: number, d3: number): 'triplet' | 'pair' | 'six' {
  if (d1 === d2 && d2 === d3) return 'triplet';
  if (d1 === d2 || d2 === d3 || d1 === d3) return 'pair';
  return 'six';
}

export function isSequence(d1: number, d2: number, d3: number): boolean {
  const sorted = [d1, d2, d3].sort((a, b) => a - b);
  return sorted[2] - sorted[1] === 1 && sorted[1] - sorted[0] === 1;
}

export function getOddEvenRatio(d1: number, d2: number, d3: number): string {
  const odds = [d1, d2, d3].filter(d => d % 2 === 1).length;
  return `${odds}:${3 - odds}`;
}

export function getBigSmallRatio(d1: number, d2: number, d3: number): string {
  const bigs = [d1, d2, d3].filter(d => d >= 5).length;
  return `${bigs}:${3 - bigs}`;
}

export function getGroupLabel(group: string): string {
  switch (group) {
    case 'triplet': return '豹子';
    case 'pair': return '对子';
    case 'six': return '组六';
    default: return group;
  }
}

export function getPositionLabel(position: number): string {
  switch (position) {
    case 1: return '百位';
    case 2: return '十位';
    case 3: return '个位';
    default: return `位置${position}`;
  }
}

export function getHeatLevel(missing: number): number {
  if (missing <= 2) return 0;
  if (missing <= 5) return 1;
  if (missing <= 10) return 2;
  if (missing <= 15) return 3;
  if (missing <= 20) return 4;
  return 5;
}

export function getHeatColor(missing: number): string {
  const level = getHeatLevel(missing);
  const colors = ['#27ae60', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#c0392b'];
  return colors[level];
}

// --- New classification functions ---

export function isBig(d: number): boolean {
  return d >= 5;
}

export function isOdd(d: number): boolean {
  return d % 2 === 1;
}

// FC3D convention: primes = {1,2,3,5,7}, composites = {0,4,6,8,9}
const PRIME_DIGITS = new Set([1, 2, 3, 5, 7]);
export function isPrimeDigit(d: number): boolean {
  return PRIME_DIGITS.has(d);
}

export function get012Road(d: number): number {
  return d % 3;
}

export function getBigSmallLabel(d: number): string {
  return d >= 5 ? '大' : '小';
}

export function getOddEvenLabel(d: number): string {
  return d % 2 === 1 ? '奇' : '偶';
}

export function getPrimeCompositeLabel(d: number): string {
  return isPrimeDigit(d) ? '质' : '合';
}

export function getBigSmallPattern(d1: number, d2: number, d3: number): string {
  return [d1, d2, d3].map(getBigSmallLabel).join('');
}

export function getOddEvenPattern(d1: number, d2: number, d3: number): string {
  return [d1, d2, d3].map(getOddEvenLabel).join('');
}

export function getPrimeCompositePattern(d1: number, d2: number, d3: number): string {
  return [d1, d2, d3].map(getPrimeCompositeLabel).join('');
}

export function getRoad012Pattern(d1: number, d2: number, d3: number): [number, number, number] {
  return [get012Road(d1), get012Road(d2), get012Road(d3)];
}

// All 8 big/small patterns
export const BIG_SMALL_PATTERNS = [
  '大大大', '大大小', '大小大', '大小小',
  '小大大', '小大小', '小小大', '小小小',
];

// All 8 odd/even patterns
export const ODD_EVEN_PATTERNS = [
  '奇奇奇', '奇奇偶', '奇偶奇', '奇偶偶',
  '偶奇奇', '偶奇偶', '偶偶奇', '偶偶偶',
];

// All 8 prime/composite patterns
export const PRIME_COMPOSITE_PATTERNS = [
  '质质质', '质质合', '质合质', '质合合',
  '合质质', '合质合', '合合质', '合合合',
];

// Position digit accessor
export function getDigitAtPosition(draw: { digit1: number; digit2: number; digit3: number }, position: 1 | 2 | 3): number {
  switch (position) {
    case 1: return draw.digit1;
    case 2: return draw.digit2;
    case 3: return draw.digit3;
  }
}
