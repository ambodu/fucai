export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'radar' | 'heatmap';
  title: string;
  xAxis?: string[];
  series: Array<{
    name: string;
    data: number[];
    color?: string;
  }>;
}

export interface AIResponse {
  text: string;
  charts: ChartData[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  disclaimer?: boolean;
  charts?: ChartData[];
}

export interface QuickTemplate {
  id: string;
  label: string;
  question: string;
}
