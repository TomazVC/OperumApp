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
}

export type RiskProfile = 'Conservador' | 'Moderado' | 'Agressivo';

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
