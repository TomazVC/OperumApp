import {
  StockQuote,
  MarketIndex,
  Dividend,
  MarketData,
  NewsItem,
} from '../../shared/types';
import brapiService from './brapiService';
import awesomeApiService from './awesomeApiService';
import ibgeService from './ibgeService';

// Cache simples para evitar muitas requisições
const cache = new Map<string, {data: any; timestamp: number}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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

// Funções da API
export const dadosMercadoAPI = {
  // Buscar cotação de uma ação
  getStockQuote: async (ticker: string): Promise<StockQuote> => {
    try {
      return await brapiService.getStockQuote(ticker);
    } catch (error) {
      console.warn(`Erro ao buscar cotação de ${ticker}, usando dados mockados`);
      return generateMockQuote(ticker);
    }
  },

  // Buscar índices de mercado
  getMarketIndices: async (): Promise<MarketIndex[]> => {
    try {
      const [dollarData, ibovespaData] = await Promise.all([
        awesomeApiService.getDollarQuote(),
        awesomeApiService.getIbovespaQuote(),
      ]);

      const data: MarketIndex[] = [
        {
          name: 'Ibovespa',
          value: ibovespaData.value,
          change: ibovespaData.change,
          changePercent: ibovespaData.changePercent,
        },
        {
          name: 'Dólar',
          value: dollarData.value,
          change: dollarData.change,
          changePercent: dollarData.changePercent,
        },
      ];

      return data;
    } catch (error) {
      console.warn('Erro ao buscar índices, usando dados mockados');
      return generateMockIndices();
    }
  },

  // Buscar dividendos de uma ação
  getDividends: async (ticker: string): Promise<Dividend[]> => {
    // Brapi não fornece dados de dividendos, retornar dados mockados
    console.warn(`Dividendos não disponíveis via Brapi para ${ticker}, usando dados mockados`);
    return generateMockDividends(ticker);
  },

  // Buscar dados macroeconômicos
  getMacroIndicators: async (): Promise<MarketData> => {
    try {
      const [awesomeData, ipcaData] = await Promise.all([
        awesomeApiService.getMacroIndicators(),
        ibgeService.getIPCA(),
      ]);

      const data: MarketData = {
        ...awesomeData,
        ipca: ipcaData,
        lastUpdate: new Date().toISOString(),
      };

      return data;
    } catch (error) {
      console.warn('Erro ao buscar indicadores macro, usando dados mockados');
      return generateMockMarketData();
    }
  },

  // Buscar notícias do mercado
  getNews: async (limit: number = 10): Promise<NewsItem[]> => {
    // APIs gratuitas não fornecem notícias, retornar dados mockados
    console.warn('Notícias não disponíveis via APIs gratuitas, usando dados mockados');
    return generateMockNews();
  },

  // Buscar lista de tickers disponíveis
  getAvailableTickers: async (): Promise<string[]> => {
    try {
      return await brapiService.getAvailableTickers();
    } catch (error) {
      console.warn('Erro ao buscar tickers, usando lista mockada');
      return ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'WEGE3', 'MGLU3', 'RENT3', 'B3SA3', 'SUZB3'];
    }
  },
};

// Funções auxiliares para dados mockados
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

const generateMockIndices = (): MarketIndex[] => [
  {
    name: 'Ibovespa',
    value: 120000 + Math.random() * 10000,
    change: (Math.random() - 0.5) * 2000,
    changePercent: (Math.random() - 0.5) * 5,
  },
  {
    name: 'Dólar',
    value: 5.0 + Math.random() * 0.5,
    change: (Math.random() - 0.5) * 0.2,
    changePercent: (Math.random() - 0.5) * 4,
  },
];

const generateMockDividends = (ticker: string): Dividend[] => [
  {
    ticker,
    value: Math.random() * 2,
    exDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    paymentDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'dividend',
  },
];

const generateMockMarketData = (): MarketData => ({
  ibovespa: {
    name: 'Ibovespa',
    value: 120000 + Math.random() * 10000,
    change: (Math.random() - 0.5) * 2000,
    changePercent: (Math.random() - 0.5) * 5,
  },
  dolar: {
    name: 'Dólar',
    value: 5.0 + Math.random() * 0.5,
    change: (Math.random() - 0.5) * 0.2,
    changePercent: (Math.random() - 0.5) * 4,
  },
  selic: 10.0 + Math.random() * 2,
  ipca: 4.0 + Math.random() * 2,
  lastUpdate: new Date().toISOString(),
});

const generateMockNews = (): NewsItem[] => [
  {
    id: '1',
    title: 'Mercado financeiro em alta com expectativas positivas',
    summary: 'Os principais índices registraram ganhos significativos...',
    url: 'https://example.com/news/1',
    publishedAt: new Date().toISOString(),
    source: 'Dados de Mercado',
  },
  {
    id: '2',
    title: 'Taxa Selic mantida em 10,75% ao ano',
    summary: 'O Comitê de Política Monetária decidiu manter...',
    url: 'https://example.com/news/2',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    source: 'Dados de Mercado',
  },
];

export default dadosMercadoAPI;
