import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {StockQuote} from '../../shared/types';

// Configuração da API Brapi.dev
const BASE_URL = 'https://brapi.dev/api';
const CACHE_DURATION = 60 * 1000; // 1 minuto

// Instância do axios configurada
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache simples para evitar muitas requisições
const cache = new Map<string, {data: any; timestamp: number}>();

const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, {data, timestamp: Date.now()});
};

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('Brapi API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Interface para resposta da API Brapi
interface BrapiQuoteResponse {
  results: Array<{
    symbol: string;
    shortName: string;
    longName: string;
    currency: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketVolume: number;
    regularMarketHigh: number;
    regularMarketLow: number;
    regularMarketOpen: number;
    regularMarketPreviousClose: number;
    marketCap: number;
    exchange: string;
  }>;
  requestedAt: string;
  took: string;
}

// Função para buscar cotação de uma ação
export const getStockQuote = async (ticker: string): Promise<StockQuote> => {
  const cacheKey = `quote_${ticker}`;
  const cached = getCachedData<StockQuote>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get<BrapiQuoteResponse>(`/quote/${ticker}`);
    
    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(`Ticker ${ticker} não encontrado`);
    }

    const result = response.data.results[0];
    const data: StockQuote = {
      ticker: result.symbol,
      price: result.regularMarketPrice || 0,
      change: result.regularMarketChange || 0,
      changePercent: result.regularMarketChangePercent || 0,
      volume: result.regularMarketVolume || 0,
      high: result.regularMarketHigh || 0,
      low: result.regularMarketLow || 0,
      open: result.regularMarketOpen || 0,
      previousClose: result.regularMarketPreviousClose || 0,
    };

    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`Erro ao buscar cotação de ${ticker} via Brapi, usando dados mockados`);
    return generateMockQuote(ticker);
  }
};

// Função para buscar múltiplas cotações
export const getMultipleStockQuotes = async (tickers: string[]): Promise<StockQuote[]> => {
  const cacheKey = `quotes_${tickers.sort().join(',')}`;
  const cached = getCachedData<StockQuote[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get<BrapiQuoteResponse>(`/quote/${tickers.join(',')}`);
    
    if (!response.data.results || response.data.results.length === 0) {
      throw new Error('Nenhuma cotação encontrada');
    }

    const data: StockQuote[] = response.data.results.map(result => ({
      ticker: result.symbol,
      price: result.regularMarketPrice || 0,
      change: result.regularMarketChange || 0,
      changePercent: result.regularMarketChangePercent || 0,
      volume: result.regularMarketVolume || 0,
      high: result.regularMarketHigh || 0,
      low: result.regularMarketLow || 0,
      open: result.regularMarketOpen || 0,
      previousClose: result.regularMarketPreviousClose || 0,
    }));

    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`Erro ao buscar cotações via Brapi, usando dados mockados`);
    return tickers.map(ticker => generateMockQuote(ticker));
  }
};

// Função para buscar lista de tickers disponíveis
export const getAvailableTickers = async (): Promise<string[]> => {
  const cacheKey = 'available_tickers';
  const cached = getCachedData<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get('/quote/list');
    
    if (!response.data.stocks || !Array.isArray(response.data.stocks)) {
      throw new Error('Formato de resposta inválido');
    }

    const data: string[] = response.data.stocks.map((stock: any) => stock.stock);
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.warn('Erro ao buscar tickers via Brapi, usando lista mockada');
    return ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'WEGE3', 'MGLU3', 'RENT3', 'B3SA3', 'SUZB3'];
  }
};

// Função auxiliar para dados mockados
const generateMockQuote = (ticker: string): StockQuote => {
  const basePrice = Math.random() * 100 + 10;
  const change = (Math.random() - 0.5) * 10;
  
  return {
    ticker,
    price: Number(basePrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(((change / basePrice) * 100).toFixed(2)),
    volume: Math.floor(Math.random() * 1000000),
    high: Number((basePrice + Math.random() * 5).toFixed(2)),
    low: Number((basePrice - Math.random() * 5).toFixed(2)),
    open: Number((basePrice + (Math.random() - 0.5) * 2).toFixed(2)),
    previousClose: Number((basePrice - change).toFixed(2)),
  };
};

export default {
  getStockQuote,
  getMultipleStockQuotes,
  getAvailableTickers,
};
