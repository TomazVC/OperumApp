export interface User {
  id: number;
  cpf: string;
  name: string;
  email?: string;
  riskProfile?: string;
  objectives?: string;
  createdAt: string;
}

export interface PortfolioItem {
  id: number;
  userId: number;
  assetName: string;
  assetType?: string;
  amount: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  userId?: number;
  role?: 'system' | 'user' | 'assistant';
}

export type ChatRole = 'system' | 'user' | 'assistant';

export type RiskProfile = 'Conservador' | 'Moderado' | 'Agressivo';

// Tipos para questionário de perfil de investidor
export interface QuestionOption {
  id: string;
  text: string;
  value: number; // Pontuação para cálculo do perfil
}

export interface RiskQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: QuestionOption[];
}

export interface RiskProfileAnswers {
  [questionId: string]: number; // questionId -> option value
}

// Novos tipos para API do Dados de Mercado
export interface StockQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface Dividend {
  ticker: string;
  value: number;
  exDate: string;
  paymentDate: string;
  type: string;
}

export interface MarketData {
  ibovespa: MarketIndex;
  dolar: MarketIndex;
  selic: number;
  ipca: number;
  lastUpdate: string;
}

export interface StockPosition {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
  change: number;
  changePercent: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
}
