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

export interface DataCard {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  sub?: string;
}

export interface AIResponse {
  text: string;
  charts: ChartData[];
  dataCards?: DataCard[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  disclaimer?: boolean;
  charts?: ChartData[];
  dataCards?: DataCard[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface ConversationMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  preview: string;
}

export interface QuickTemplate {
  id: string;
  label: string;
  question: string;
}
