// FC3D Draw result
export interface FC3DDraw {
  id: number;
  period: string;
  drawDate: string;
  digit1: number;
  digit2: number;
  digit3: number;
  sum: number;
  span: number;
  sumTail: number;           // sum % 10
  oddCount: number;
  evenCount: number;
  bigCount: number;
  smallCount: number;
  isTriplet: boolean;
  isPair: boolean;
  isSequence: boolean;
  group: 'triplet' | 'pair' | 'six';
  bigSmallPattern: string;   // e.g. "小大大"
  oddEvenPattern: string;    // e.g. "奇偶奇"
  primeCompositePattern: string; // e.g. "质合质"
  road012: [number, number, number]; // each digit % 3
}

export interface FC3DStatistics {
  id: number;
  position: number;
  digit: number;
  totalCount: number;
  totalPeriods: number;
  frequency: number;
  currentMissing: number;
  maxMissing: number;
  avgMissing: number;
  last30Count: number;
  last50Count: number;
  last100Count: number;
  lastAppearPeriod: string | null;
  lastAppearDate: string | null;
}

export interface TrendDataPoint {
  period: string;
  digit1: number;
  digit2: number;
  digit3: number;
  sum: number;
  span: number;
}

export interface Briefing {
  id: number;
  period: string;
  drawDate: string;
  content: BriefingContent;
  contentText: string;
  status: number;
}

export interface BriefingContent {
  drawNumbers: { digit1: number; digit2: number; digit3: number };
  basicFeatures: {
    sum: number;
    span: number;
    oddEven: string;
    bigSmall: string;
    group: string;
  };
  missingChanges: {
    endedMissing: Array<{ position: number; digit: number; wasMissing: number }>;
    longestMissing: Array<{ position: number; digit: number; currentMissing: number }>;
  };
  frequencyData: {
    digit1Top: { digit: number; count: number; in: number };
    digit1Bottom: { digit: number; count: number; in: number };
  };
  sumTrend: {
    last10: number[];
    avg50: number;
  };
}
