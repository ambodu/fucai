// Trend table cell data
export interface TrendCellData {
  isHit: boolean;
  missingCount: number;
}

// Statistics row at bottom of trend tables
export interface TrendStatRow {
  label: string;
  values: number[];
}

// Pattern type definitions
export type PatternType = 'big-small' | 'odd-even' | 'prime-composite' | '012-road';

// Prediction result
export interface PredictionResult {
  position: number;
  positionLabel: string;
  hotDigits: Array<{ digit: number; count: number; reason: string }>;
  coldDigits: Array<{ digit: number; missingPeriods: number; reason: string }>;
  recommendedDigits: number[];
}

export interface PredictionSummary {
  positions: PredictionResult[];
  sumRange: { min: number; max: number; avg: number };
  spanRange: { min: number; max: number; avg: number };
  likelyPatterns: {
    bigSmall: string[];
    oddEven: string[];
  };
}
