import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {MarketData} from '../../shared/types';

// Configuração da API AwesomeAPI
const BASE_URL = '                                                                                                                                                                                        ';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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
    console.error('AwesomeAPI Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Interface para resposta da API AwesomeAPI
interface CurrencyResponse {
  code: string;
  codein: string;
  name: string;
  high: string;
  low: string;
  varBid: string;
  pctChange: string;
  bid: string;
  ask: string;
  timestamp: string;
  create_date: string;
}

interface SelicResponse {
  date: string;
  value: string;
}

// Função para buscar cotação do dólar
export const getDollarQuote = async (): Promise<{value: number; change: number; changePercent: number}> => {
  const cacheKey = 'dollar_quote';
  const cached = getCachedData<{value: number; change: number; changePercent: number}>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get('/json/last/USD-BRL');
    
    if (!response.data || !response.data.USDBRL) {
      throw new Error('Dados do dólar não encontrados');
    }

    const data = response.data.USDBRL;
    const result = {
      value: parseFloat(data.bid) || 0,
      change: parseFloat(data.varBid) || 0,
      changePercent: parseFloat(data.pctChange) || 0,
    };

    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Erro ao buscar cotação do dólar via AwesomeAPI, usando dados mockados');
    return generateMockDollarQuote();
  }
};

// Função para buscar índice Ibovespa
export const getIbovespaQuote = async (): Promise<{value: number; change: number; changePercent: number}> => {
  const cacheKey = 'ibovespa_quote';
  const cached = getCachedData<{value: number; change: number; changePercent: number}>(cacheKey);
  if (cached) return cached;

  try {
    // A AwesomeAPI não tem Ibovespa, vamos tentar com outros índices disponíveis
    // Por enquanto, vamos usar dados mockados
    throw new Error('Ibovespa não disponível na AwesomeAPI');
  } catch (error) {
    console.warn('Erro ao buscar cotação do Ibovespa via AwesomeAPI, usando dados mockados');
    return generateMockIbovespaQuote();
  }
};

// Função para buscar taxa Selic
export const getSelicRate = async (): Promise<number> => {
  const cacheKey = 'selic_rate';
  const cached = getCachedData<number>(cacheKey);
  if (cached) return cached;

  try {
    // A AwesomeAPI não tem endpoint direto para Selic
    // Vamos usar dados mockados por enquanto
    throw new Error('Selic não disponível na AwesomeAPI');
  } catch (error) {
    console.warn('Erro ao buscar taxa Selic via AwesomeAPI, usando dados mockados');
    return generateMockSelicRate();
  }
};

// Função para buscar Euro
export const getEuroQuote = async (): Promise<{value: number; change: number; changePercent: number}> => {
  const cacheKey = 'euro_quote';
  const cached = getCachedData<{value: number; change: number; changePercent: number}>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get('/json/last/EUR-BRL');
    
    if (!response.data || !response.data.EURBRL) {
      throw new Error('Dados do Euro não encontrados');
    }

    const data = response.data.EURBRL;
    const result = {
      value: parseFloat(data.bid) || 0,
      change: parseFloat(data.varBid) || 0,
      changePercent: parseFloat(data.pctChange) || 0,
    };

    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Erro ao buscar cotação do Euro via AwesomeAPI, usando dados mockados');
    return generateMockEuroQuote();
  }
};

// Função para buscar Bitcoin
export const getBitcoinQuote = async (): Promise<{value: number; change: number; changePercent: number}> => {
  const cacheKey = 'bitcoin_quote';
  const cached = getCachedData<{value: number; change: number; changePercent: number}>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get('/json/last/BTC-BRL');
    
    if (!response.data || !response.data.BTCBRL) {
      throw new Error('Dados do Bitcoin não encontrados');
    }

    const data = response.data.BTCBRL;
    const result = {
      value: parseFloat(data.bid) || 0,
      change: parseFloat(data.varBid) || 0,
      changePercent: parseFloat(data.pctChange) || 0,
    };

    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Erro ao buscar cotação do Bitcoin via AwesomeAPI, usando dados mockados');
    return generateMockBitcoinQuote();
  }
};

// Função para buscar múltiplas moedas
export const getMultipleCurrencies = async (currencies: string[] = ['USD-BRL', 'EUR-BRL', 'GBP-BRL']): Promise<any> => {
  const cacheKey = `multiple_currencies_${currencies.join(',')}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get(`/json/last/${currencies.join(',')}`);
    
    if (!response.data) {
      throw new Error('Dados das moedas não encontrados');
    }

    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.warn('Erro ao buscar múltiplas moedas via AwesomeAPI, usando dados mockados');
    return generateMockMultipleCurrencies();
  }
};

// Função para buscar todos os indicadores macroeconômicos
export const getMacroIndicators = async (): Promise<MarketData> => {
  const cacheKey = 'macro_indicators';
  const cached = getCachedData<MarketData>(cacheKey);
  if (cached) return cached;

  try {
    const [dollarData, ibovespaData, selicData] = await Promise.all([
      getDollarQuote(),
      getIbovespaQuote(),
      getSelicRate(),
    ]);

    const data: MarketData = {
      ibovespa: {
        name: 'Ibovespa',
        value: ibovespaData.value,
        change: ibovespaData.change,
        changePercent: ibovespaData.changePercent,
      },
      dolar: {
        name: 'Dólar',
        value: dollarData.value,
        change: dollarData.change,
        changePercent: dollarData.changePercent,
      },
      selic: selicData,
      ipca: 0, // Será preenchido pelo IBGE service
      lastUpdate: new Date().toISOString(),
    };

    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.warn('Erro ao buscar indicadores macro via AwesomeAPI, usando dados mockados');
    return generateMockMarketData();
  }
};

// Funções auxiliares para dados mockados
const generateMockDollarQuote = (): {value: number; change: number; changePercent: number} => {
  const baseValue = 5.0 + Math.random() * 0.5;
  const change = (Math.random() - 0.5) * 0.2;
  return {
    value: Number(baseValue.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(((change / baseValue) * 100).toFixed(2)),
  };
};

const generateMockEuroQuote = (): {value: number; change: number; changePercent: number} => {
  const baseValue = 6.0 + Math.random() * 0.5;
  const change = (Math.random() - 0.5) * 0.2;
  return {
    value: Number(baseValue.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(((change / baseValue) * 100).toFixed(2)),
  };
};

const generateMockBitcoinQuote = (): {value: number; change: number; changePercent: number} => {
  const baseValue = 500000 + Math.random() * 100000;
  const change = (Math.random() - 0.5) * 20000;
  return {
    value: Number(baseValue.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(((change / baseValue) * 100).toFixed(2)),
  };
};

const generateMockMultipleCurrencies = () => ({
  USDBRL: {
    code: 'USD',
    codein: 'BRL',
    name: 'Dólar Americano/Real Brasileiro',
    bid: '5.35',
    ask: '5.36',
    varBid: '0.01',
    pctChange: '0.18',
  },
  EURBRL: {
    code: 'EUR',
    codein: 'BRL',
    name: 'Euro/Real Brasileiro',
    bid: '6.20',
    ask: '6.21',
    varBid: '0.02',
    pctChange: '0.32',
  },
});

const generateMockIbovespaQuote = (): {value: number; change: number; changePercent: number} => {
  const baseValue = 120000 + Math.random() * 10000;
  const change = (Math.random() - 0.5) * 2000;
  return {
    value: Number(baseValue.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(((change / baseValue) * 100).toFixed(2)),
  };
};

const generateMockSelicRate = (): number => {
  return Number((10.0 + Math.random() * 2).toFixed(2));
};

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

export default {
  getDollarQuote,
  getEuroQuote,
  getBitcoinQuote,
  getIbovespaQuote,
  getSelicRate,
  getMultipleCurrencies,
  getMacroIndicators,
};
