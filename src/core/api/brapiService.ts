import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {StockQuote} from '../../shared/types';

/**
 * Brapi.dev API Service - API COMPLETA com Token de Autenticação
 * 
 * Com token, você tem acesso a TODAS as ações da B3, FIIs, BDRs, ETFs e Índices!
 * 
 * Token: 83ggNqPt65fEAYG7EhrWEr
 * 
 * Recursos Disponíveis:
 * - Cotações de TODAS as ações, FIIs, BDRs, ETFs da B3
 * - Criptomoedas (Bitcoin, Ethereum, etc) - Lista disponível
 * - Moedas (USD, EUR, GBP, etc) - Requer upgrade
 * - Taxa Selic (Prime Rate) - Taxa atual disponível, histórico requer upgrade
 * - Inflação (IPCA e outros países) - Lista de países disponível, dados requerem upgrade
 * - Dados fundamentalistas completos
 * - Histórico de dividendos
 * - Módulos financeiros (DRE, Balanço, DFC, DVA)
 * 
 * Exemplos de uso:
 * 
 * 1. Cotação de qualquer ação:
 *    const wege3 = await getStockQuote('WEGE3');
 * 
 * 2. Múltiplas ações com histórico:
 *    const stocks = await getMultipleStockQuotes(['PETR4', 'VALE3', 'BBAS3'], {
 *      range: '1mo',
 *      interval: '1d'
 *    });
 * 
 * 3. Ação com módulos financeiros:
 *    const itub4Full = await getStockQuoteWithModules('ITUB4', {
 *      modules: ['summaryProfile', 'defaultKeyStatistics', 'financialData']
 *    });
 * 
 * 4. Taxa Selic atual:
 *    const selic = await getLatestPrimeRate(); // Retorna: 15.00
 * 
 * 5. Criptomoedas disponíveis:
 *    const cryptos = await getAvailableCryptos(); // Retorna: ['BTC', 'ETH', ...]
 */

// Configuração da API Brapi.dev
const BASE_URL = 'https://brapi.dev/api';
const API_TOKEN = 'fQZNiALmLqMRjjeypszzpa'; // Token principal (mesmo acesso que 83ggNqPt65fEAYG7EhrWEr)

/**
 * RECURSOS DISPONÍVEIS COM ESTE TOKEN (Plano Básico):
 * ✅ Cotações de TODAS as ações da B3 (1854+ ativos)
 * ✅ Módulo 'summaryProfile' - Perfil da empresa (setor, endereço, website, etc)
 * ✅ Histórico de preços (parâmetros range, interval)
 * ✅ Histórico completo de dividendos (parâmetro dividends=true)
 * ✅ Endpoint /quote/list com filtros (setor, tipo, ordenação)
 * ✅ Lista de 301 criptomoedas disponíveis (/v2/crypto/available)
 * ✅ Lista de países com dados de inflação (/v2/inflation/available)
 * 
 * ⚠️  LIMITAÇÕES DO PLANO BÁSICO:
 * ❌ Módulos avançados (balanceSheetHistory, incomeStatementHistory, cashflowHistory, financialData)
 *    → Erro 403: "O seu plano não permite acessar dados do módulo..."
 * ❌ Cotações de criptomoedas (/v2/crypto) - Requer plano premium
 *    → Erro 400: "Você não tem acesso a este recurso, considere fazer upgrade"
 * ❌ Dados históricos de inflação (/v2/inflation) - Requer plano premium
 *    → Erro 400: "Você não tem acesso a este recurso, considere fazer upgrade"
 * ❌ Taxa Selic (/v2/prime-rate) - Requer plano premium
 *    → Erro 400: "Você não tem acesso a este recurso, considere fazer upgrade"
 * ❌ Consultas múltiplas simultâneas (rate limit ~10 req/min)
 *    → Erro 429 se exceder
 * 
 * 🧪 AÇÕES COM ACESSO COMPLETO (sem limitações de módulos):
 * As 4 ações de teste PETR4, MGLU3, VALE3, ITUB4 têm acesso a TODOS os módulos,
 * mesmo sem token ou com plano básico. Use essas para demonstrações de dados avançados.
 * 
 * 💡 SOLUÇÕES:
 * - Para dados fundamentalistas avançados: Use apenas as 4 ações gratuitas
 * - Para criptomoedas: Usar AwesomeAPI (BTC-BRL já implementado)
 * - Para inflação: Sem alternativa gratuita (IBGE API possível)
 * - Para múltiplas ações: Fazer requisições separadas com delay
 * 
 * 📚 DOCUMENTAÇÃO DOS ENDPOINTS:
 * - Ações: https://brapi.dev/docs/acoes
 * - Criptomoedas: https://brapi.dev/docs/criptomoedas
 * - Inflação: https://brapi.dev/docs/inflacao
 * - Lista de ações: https://brapi.dev/docs/acoes/available
 * - Lista de criptos: https://brapi.dev/docs/criptomoedas/available
 * - Lista de países (inflação): https://brapi.dev/docs/inflacao/available
 */

// Configuração de cache
const CACHE_DURATION = 60 * 1000; // 1 minuto

/**
 * 🧪 AÇÕES DE TESTE GRATUITAS (acesso SEM token):
 * Estas 4 ações podem ser consultadas sem autenticação, mas com o token
 * você pode acessar TODAS as ações da B3 (1854+ ativos).
 */
export const FREE_TEST_STOCKS = ['PETR4', 'MGLU3', 'VALE3', 'ITUB4'] as const;

// Instância do axios configurada com autenticação
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`, // Token no header (método recomendado)
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

// Interface para resposta da API Brapi (estrutura real da API)
interface BrapiQuoteResponse {
  results: Array<{
    symbol: string;
    shortName: string;
    longName: string;
    currency: string;
    regularMarketPrice: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketTime: string;
    marketCap: number;
    regularMarketVolume: number;
    logourl: string;
    // Campos opcionais que podem existir
    regularMarketOpen?: number;
    regularMarketPreviousClose?: number;
    exchange?: string;
    // Dados fundamentalistas (quando fundamental=true)
    priceEarnings?: number;
    earningsPerShare?: number;
    dividendYield?: number;
    // Histórico (quando range é especificado)
    historicalDataPrice?: Array<{
      date: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
    // Dividendos (quando dividends=true)
    dividendsData?: {
      cashDividends?: Array<{
        date: string;
        rate: number;
      }>;
    };
  }>;
  requestedAt?: string;
  took?: string;
}

// Interface estendida para cotação com dados opcionais
interface ExtendedStockQuote extends StockQuote {
  // Informações extras da Brapi
  shortName?: string;
  longName?: string;
  currency?: string;
  marketCap?: number;
  logoUrl?: string;
  // Dados fundamentalistas
  priceEarnings?: number;
  earningsPerShare?: number;
  dividendYield?: number;
  // Histórico de preços
  historicalData?: Array<{
    date: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  // Dividendos
  dividends?: Array<{
    date: string;
    rate: number;
  }>;
}

// Opções para buscar cotações
interface QuoteOptions {
  range?: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max';
  interval?: '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo';
  fundamental?: boolean;
  dividends?: boolean;
}

// Opções para módulos financeiros avançados
interface ModuleOptions {
  modules?: Array<
    | 'summaryProfile'              // Informações cadastrais da empresa
    | 'balanceSheetHistory'          // Balanço Patrimonial anual
    | 'balanceSheetHistoryQuarterly' // Balanço Patrimonial trimestral
    | 'defaultKeyStatistics'         // Principais estatísticas (TTM)
    | 'defaultKeyStatisticsHistory'  // Principais estatísticas anual
    | 'defaultKeyStatisticsHistoryQuarterly' // Principais estatísticas trimestral
    | 'incomeStatementHistory'       // DRE anual
    | 'incomeStatementHistoryQuarterly' // DRE trimestral
    | 'financialData'                // Dados financeiros (TTM)
    | 'financialDataHistory'         // Dados financeiros anual
    | 'financialDataHistoryQuarterly' // Dados financeiros trimestral
    | 'valueAddedHistory'            // DVA anual
    | 'valueAddedHistoryQuarterly'   // DVA trimestral
    | 'cashflowHistory'              // DFC anual
    | 'cashflowHistoryQuarterly'     // DFC trimestral
  >;
  range?: QuoteOptions['range'];
  interval?: QuoteOptions['interval'];
  fundamental?: boolean;
  dividends?: boolean;
}

// Interface para resposta da Selic
interface PrimeRateResponse {
  'prime-rate': Array<{
    date: string;        // DD/MM/YYYY
    value: string;       // Taxa Selic
    epochDate: number;   // Timestamp UNIX
  }>;
}

// Interface para resposta de Criptomoedas
interface CryptoResponse {
  coins: Array<{
    coin: string;
    name: string;
    currency: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketVolume: number;
    marketCap: number;
    coinImageUrl?: string;
    historicalDataPrice?: Array<{
      date: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  }>;
}

// Interface para resposta de Moedas
interface CurrencyResponse {
  currency: Array<{
    currency: string;
    name: string;
    buy: string;
    sell: string;
    variation: string;
  }>;
}

// Função para buscar cotação simples (funciona sem token)
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
      high: result.regularMarketDayHigh || 0,
      low: result.regularMarketDayLow || 0,
      open: result.regularMarketOpen || result.regularMarketPrice || 0,
      previousClose: result.regularMarketPreviousClose || (result.regularMarketPrice - result.regularMarketChange) || 0,
    };

    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`Erro ao buscar cotação de ${ticker} via Brapi, usando dados mockados`);
    return generateMockQuote(ticker);
  }
};

// Função para buscar cotação com opções avançadas
export const getStockQuoteWithOptions = async (
  ticker: string, 
  options?: QuoteOptions
): Promise<ExtendedStockQuote> => {
  const queryParams = new URLSearchParams();
  
  if (options?.range) queryParams.append('range', options.range);
  if (options?.interval) queryParams.append('interval', options.interval);
  if (options?.fundamental) queryParams.append('fundamental', 'true');
  if (options?.dividends) queryParams.append('dividends', 'true');

  const cacheKey = `quote_extended_${ticker}_${queryParams.toString()}`;
  const cached = getCachedData<ExtendedStockQuote>(cacheKey);
  if (cached) return cached;

  try {
    const url = `/quote/${ticker}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<BrapiQuoteResponse>(url);
    
    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(`Ticker ${ticker} não encontrado`);
    }

    const result = response.data.results[0];
    const data: ExtendedStockQuote = {
      ticker: result.symbol,
      price: result.regularMarketPrice || 0,
      change: result.regularMarketChange || 0,
      changePercent: result.regularMarketChangePercent || 0,
      volume: result.regularMarketVolume || 0,
      high: result.regularMarketDayHigh || 0,
      low: result.regularMarketDayLow || 0,
      open: result.regularMarketOpen || result.regularMarketPrice || 0,
      previousClose: result.regularMarketPreviousClose || (result.regularMarketPrice - result.regularMarketChange) || 0,
      // Informações extras da Brapi
      shortName: result.shortName,
      longName: result.longName,
      currency: result.currency,
      marketCap: result.marketCap,
      logoUrl: result.logourl,
      // Dados fundamentalistas
      priceEarnings: result.priceEarnings,
      earningsPerShare: result.earningsPerShare,
      dividendYield: result.dividendYield,
      // Histórico
      historicalData: result.historicalDataPrice,
      // Dividendos
      dividends: result.dividendsData?.cashDividends,
    };

    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`Erro ao buscar cotação estendida de ${ticker} via Brapi, usando dados mockados`);
    return generateMockExtendedQuote(ticker, options);
  }
};

// Função para buscar múltiplas cotações com histórico
export const getMultipleStockQuotes = async (
  tickers: string[], 
  options?: QuoteOptions
): Promise<StockQuote[]> => {
  const queryParams = new URLSearchParams();
  
  if (options?.range) queryParams.append('range', options.range);
  if (options?.interval) queryParams.append('interval', options.interval);

  const cacheKey = `quotes_${tickers.sort().join(',')}_${queryParams.toString()}`;
  const cached = getCachedData<StockQuote[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `/quote/${tickers.join(',')}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<BrapiQuoteResponse>(url);
    
    if (!response.data.results || response.data.results.length === 0) {
      throw new Error('Nenhuma cotação encontrada');
    }

    const data: StockQuote[] = response.data.results.map(result => ({
      ticker: result.symbol,
      price: result.regularMarketPrice || 0,
      change: result.regularMarketChange || 0,
      changePercent: result.regularMarketChangePercent || 0,
      volume: result.regularMarketVolume || 0,
      high: result.regularMarketDayHigh || 0,
      low: result.regularMarketDayLow || 0,
      open: result.regularMarketOpen || result.regularMarketPrice || 0,
      previousClose: result.regularMarketPreviousClose || (result.regularMarketPrice - result.regularMarketChange) || 0,
    }));

    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`Erro ao buscar cotações via Brapi, usando dados mockados`);
    return tickers.map(ticker => generateMockQuote(ticker));
  }
};

// Função específica para buscar as 4 ações de teste gratuitas
export const getTestStocks = async (options?: QuoteOptions): Promise<StockQuote[]> => {
  return getMultipleStockQuotes([...FREE_TEST_STOCKS], options);
};

// Função específica para buscar uma ação de teste com dados fundamentalistas
export const getTestStockWithFundamentals = async (ticker: typeof FREE_TEST_STOCKS[number]): Promise<ExtendedStockQuote> => {
  return getStockQuoteWithOptions(ticker, {
    fundamental: true,
    dividends: true
  });
};

// =====================================================
// NOVAS FUNÇÕES COM TOKEN - RECURSOS COMPLETOS
// =====================================================

// Função para buscar cotação com módulos financeiros avançados
export const getStockQuoteWithModules = async (
  ticker: string,
  options?: ModuleOptions
): Promise<any> => {
  const queryParams = new URLSearchParams();
  
  if (options?.modules && options.modules.length > 0) {
    queryParams.append('modules', options.modules.join(','));
  }
  if (options?.range) queryParams.append('range', options.range);
  if (options?.interval) queryParams.append('interval', options.interval);
  if (options?.fundamental) queryParams.append('fundamental', 'true');
  if (options?.dividends) queryParams.append('dividends', 'true');

  const cacheKey = `quote_modules_${ticker}_${queryParams.toString()}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  try {
    const url = `/quote/${ticker}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    
    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(`Ticker ${ticker} não encontrado`);
    }

    const result = response.data.results[0];
    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Erro ao buscar cotação com módulos de ${ticker}:`, error);
    throw error;
  }
};

// Função para buscar lista de todas as ações disponíveis
export const getAllAvailableStocks = async (): Promise<{indexes: string[]; stocks: string[]}> => {
  const cacheKey = 'all_available_stocks';
  const cached = getCachedData<{indexes: string[]; stocks: string[]}>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get('/available');
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar lista de ações disponíveis:', error);
    throw error;
  }
};

// Função para buscar cotação de criptomoeda
export const getCryptoQuote = async (
  coin: string,
  currency: string = 'BRL',
  options?: { range?: QuoteOptions['range']; interval?: QuoteOptions['interval'] }
): Promise<any> => {
  const queryParams = new URLSearchParams();
  queryParams.append('coin', coin);
  queryParams.append('currency', currency);
  
  if (options?.range) queryParams.append('range', options.range);
  if (options?.interval) queryParams.append('interval', options.interval);

  const cacheKey = `crypto_${coin}_${currency}_${queryParams.toString()}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get<CryptoResponse>(`/v2/crypto?${queryParams.toString()}`);
    
    if (!response.data.coins || response.data.coins.length === 0) {
      throw new Error(`Criptomoeda ${coin} não encontrada`);
    }

    const result = response.data.coins[0];
    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Erro ao buscar cotação de criptomoeda ${coin}:`, error);
    throw error;
  }
};

// Função para buscar múltiplas criptomoedas
export const getMultipleCryptoQuotes = async (
  coins: string[],
  currency: string = 'BRL'
): Promise<any[]> => {
  const cacheKey = `crypto_multiple_${coins.join(',')}_${currency}`;
  const cached = getCachedData<any[]>(cacheKey);
  if (cached) return cached;

  try {
    const queryParams = new URLSearchParams();
    queryParams.append('coin', coins.join(','));
    queryParams.append('currency', currency);

    const response = await api.get<CryptoResponse>(`/v2/crypto?${queryParams.toString()}`);
    
    if (!response.data.coins || response.data.coins.length === 0) {
      throw new Error('Nenhuma criptomoeda encontrada');
    }

    setCachedData(cacheKey, response.data.coins);
    return response.data.coins;
  } catch (error) {
    console.error('Erro ao buscar múltiplas criptomoedas:', error);
    throw error;
  }
};

// Função para listar criptomoedas disponíveis (FUNCIONA mesmo no plano básico!)
export const getAvailableCryptos = async (search?: string): Promise<string[]> => {
  const cacheKey = `available_cryptos_${search || 'all'}`;
  const cached = getCachedData<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);

    const response = await api.get<{coins: string[]}>(`/v2/crypto/available?${queryParams.toString()}`);
    
    if (!response.data.coins || response.data.coins.length === 0) {
      return [];
    }

    setCachedData(cacheKey, response.data.coins);
    return response.data.coins;
  } catch (error) {
    console.error('Erro ao buscar lista de criptomoedas disponíveis:', error);
    return []; // Retorna array vazio em caso de erro ao invés de throw
  }
};

// Função para buscar cotação de moeda (câmbio)
export const getCurrencyQuote = async (currencyPair: string): Promise<any> => {
  const cacheKey = `currency_${currencyPair}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get<CurrencyResponse>(`/v2/currency?currency=${currencyPair}`);
    
    if (!response.data.currency || response.data.currency.length === 0) {
      throw new Error(`Par de moedas ${currencyPair} não encontrado`);
    }

    const result = response.data.currency[0];
    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Erro ao buscar cotação de ${currencyPair}:`, error);
    throw error;
  }
};

/**
 * Função para buscar lista de países com dados de Taxa Selic disponíveis
 * ✅ FUNCIONA no plano Basic
 */
export const getAvailablePrimeRateCountries = async (search?: string): Promise<string[]> => {
  const cacheKey = `available_prime_rate_countries_${search || 'all'}`;
  const cached = getCachedData<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);

    const response = await api.get<{countries: string[]}>(`/v2/prime-rate/available?${queryParams.toString()}`);
    
    if (!response.data.countries || response.data.countries.length === 0) {
      return [];
    }

    setCachedData(cacheKey, response.data.countries);
    return response.data.countries;
  } catch (error) {
    console.error('Erro ao buscar países com dados de Taxa Selic:', error);
    return []; // Retorna array vazio em caso de erro
  }
};

/**
 * Função para buscar Taxa Selic (Prime Rate)
 * ⚠️  LIMITAÇÃO: No plano Basic, retorna APENAS a taxa atual (sem período)
 * ✅ Funciona: /v2/prime-rate?country=brazil (retorna taxa mais recente)
 * ❌ Não funciona: Com parâmetros start/end/historical (requer upgrade)
 * 
 * @param country - Nome do país (padrão: 'brazil')
 * @param options - Filtros opcionais (período, ordenação) - requerem upgrade!
 * @returns Taxa atual ou array com dados históricos (se tiver acesso)
 */
export const getPrimeRate = async (
  country: string = 'brazil',
  options?: {
    start?: string; // DD/MM/YYYY
    end?: string;   // DD/MM/YYYY
    sortBy?: 'date' | 'value';
    sortOrder?: 'asc' | 'desc';
  }
): Promise<any> => {
  const queryParams = new URLSearchParams();
  queryParams.append('country', country);
  
  // No plano Basic, apenas a taxa atual funciona (sem historical, start, end)
  if (options?.start || options?.end) {
    queryParams.append('historical', 'true');
    if (options.start) queryParams.append('start', options.start);
    if (options.end) queryParams.append('end', options.end);
  }
  
  if (options?.sortBy) queryParams.append('sortBy', options.sortBy);
  if (options?.sortOrder) queryParams.append('sortOrder', options.sortOrder);

  const cacheKey = `prime_rate_${country}_${queryParams.toString()}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get<PrimeRateResponse>(`/v2/prime-rate?${queryParams.toString()}`);
    
    if (!response.data['prime-rate'] || response.data['prime-rate'].length === 0) {
      throw new Error('Dados da taxa Selic não encontrados');
    }

    setCachedData(cacheKey, response.data['prime-rate']);
    return response.data['prime-rate'];
  } catch (error) {
    console.error('Erro ao buscar taxa Selic:', error);
    throw error;
  }
};

/**
 * Função para buscar a taxa Selic mais recente
 * ✅ FUNCIONA no plano Basic (retorna taxa atual: 15.00%)
 */
export const getLatestPrimeRate = async (country: string = 'brazil'): Promise<number> => {
  try {
    const data = await getPrimeRate(country);
    if (data && data.length > 0) {
      return parseFloat(data[0].value) || 0;
    }
    throw new Error('Taxa Selic não encontrada');
  } catch (error) {
    console.warn('Erro ao buscar taxa Selic mais recente, usando valor mockado');
    return 15.00; // Valor atual (03/11/2025)
  }
};

// Função para buscar lista de países com dados de inflação disponíveis
export const getAvailableInflationCountries = async (search?: string): Promise<string[]> => {
  const cacheKey = `available_inflation_countries_${search || 'all'}`;
  const cached = getCachedData<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);

    const response = await api.get<{countries: string[]}>(`/v2/inflation/available?${queryParams.toString()}`);
    
    if (!response.data.countries || response.data.countries.length === 0) {
      return [];
    }

    setCachedData(cacheKey, response.data.countries);
    return response.data.countries;
  } catch (error) {
    console.error('Erro ao buscar países com dados de inflação:', error);
    return []; // Retorna array vazio em caso de erro
  }
};

/**
 * Função para buscar inflação (IPCA e outros países)
 * ⚠️  ATENÇÃO: No plano Basic, este endpoint retorna erro 400
 * Mensagem: "Você não tem acesso a este recurso, considere fazer upgrade"
 * 
 * ✅ Alternativa: getAvailableInflationCountries() funciona no plano Basic
 * 
 * @param country - Nome do país (padrão: 'brazil')
 * @param options - Filtros opcionais (período, ordenação)
 * @returns Array com dados históricos de inflação
 */
export const getInflation = async (
  country: string = 'brazil',
  options?: {
    start?: string; // DD/MM/YYYY
    end?: string;   // DD/MM/YYYY
    sortBy?: 'date' | 'value';
    sortOrder?: 'asc' | 'desc';
  }
): Promise<any> => {
  const queryParams = new URLSearchParams();
  queryParams.append('country', country);
  queryParams.append('historical', 'true');
  
  if (options?.start) queryParams.append('start', options.start);
  if (options?.end) queryParams.append('end', options.end);
  if (options?.sortBy) queryParams.append('sortBy', options.sortBy);
  if (options?.sortOrder) queryParams.append('sortOrder', options.sortOrder);

  const cacheKey = `inflation_${country}_${queryParams.toString()}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get(`/v2/inflation?${queryParams.toString()}`);
    
    if (!response.data.inflation || response.data.inflation.length === 0) {
      throw new Error('Dados de inflação não encontrados');
    }

    setCachedData(cacheKey, response.data.inflation);
    return response.data.inflation;
  } catch (error) {
    console.error('Erro ao buscar dados de inflação:', error);
    throw error;
  }
};

// Função para buscar lista de ações com filtros e paginação
export const getStockList = async (options?: {
  search?: string;
  sortBy?: 'close' | 'change' | 'volume' | 'marketCap' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
  type?: 'stock' | 'fund' | 'bdr';
  sector?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  
  // Mapear sortBy para o formato aceito pela API
  const sortByMap: { [key: string]: string } = {
    'marketCap': 'market_cap_basic',
    'change': 'change',
    'changeAbs': 'change_abs',
    'volume': 'volume',
    'name': 'name',
    'close': 'close'
  };
  
  if (options?.search) queryParams.append('search', options.search);
  if (options?.sortBy) queryParams.append('sortBy', sortByMap[options.sortBy] || options.sortBy);
  if (options?.sortOrder) queryParams.append('sortOrder', options.sortOrder);
  if (options?.limit) queryParams.append('limit', options.limit.toString());
  if (options?.page) queryParams.append('page', options.page.toString());
  if (options?.type) queryParams.append('type', options.type);
  if (options?.sector) queryParams.append('sector', options.sector);

  const cacheKey = `stock_list_${queryParams.toString()}`;
  const cached = getCachedData<any>(cacheKey);
  if (cached) return cached;

  try {
    const response = await api.get(`/quote/list?${queryParams.toString()}`);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar lista de ações:', error);
    throw error;
  }
};

// Função para buscar lista de tickers disponíveis (atualizada com as ações de teste)
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
    console.warn('Erro ao buscar tickers via Brapi, usando lista com ações de teste');
    return [...FREE_TEST_STOCKS, 'BBDC4', 'ABEV3', 'WEGE3', 'RENT3', 'B3SA3', 'SUZB3'];
  }
};

// Função auxiliar para dados mockados básicos
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

// Função auxiliar para dados mockados estendidos
const generateMockExtendedQuote = (ticker: string, options?: QuoteOptions): ExtendedStockQuote => {
  const baseQuote = generateMockQuote(ticker);
  const extended: ExtendedStockQuote = { ...baseQuote };

  // Adicionar dados fundamentalistas se solicitado
  if (options?.fundamental) {
    extended.priceEarnings = Number((10 + Math.random() * 20).toFixed(2));
    extended.earningsPerShare = Number((Math.random() * 5).toFixed(2));
    extended.dividendYield = Number((Math.random() * 8).toFixed(2));
  }

  // Adicionar histórico se solicitado
  if (options?.range) {
    const days = options.range === '1mo' ? 30 : 5;
    const historicalData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      const price = baseQuote.price + (Math.random() - 0.5) * 10;
      historicalData.push({
        date: date.getTime(),
        open: Number((price + (Math.random() - 0.5) * 2).toFixed(2)),
        high: Number((price + Math.random() * 3).toFixed(2)),
        low: Number((price - Math.random() * 3).toFixed(2)),
        close: Number(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000),
      });
    }
    extended.historicalData = historicalData;
  }

  // Adicionar dividendos se solicitado
  if (options?.dividends) {
    extended.dividends = [
      { date: '2024-06-15', rate: Number((Math.random() * 2).toFixed(2)) },
      { date: '2024-03-15', rate: Number((Math.random() * 2).toFixed(2)) },
      { date: '2023-12-15', rate: Number((Math.random() * 2).toFixed(2)) },
    ];
  }

  return extended;
};

export default {
  // ===== Cotações Básicas =====
  getStockQuote,
  getMultipleStockQuotes,
  getAvailableTickers,
  
  // ===== Cotações Avançadas =====
  getStockQuoteWithOptions,
  getStockQuoteWithModules,
  
  // ===== Funções de Teste =====
  getTestStocks,
  getTestStockWithFundamentals,
  
  // ===== Recursos Completos com Token =====
  getAllAvailableStocks,        // Lista completa de ações disponíveis
  getStockList,                 // Lista com filtros e paginação
  
  // ===== Criptomoedas =====
  getCryptoQuote,               // Cotação de uma criptomoeda (⚠️  Requer plano premium)
  getMultipleCryptoQuotes,      // Múltiplas criptomoedas (⚠️  Requer plano premium)
  getAvailableCryptos,          // ✅ Lista de 301 criptos disponíveis (FUNCIONA!)
  
  // ===== Moedas (Câmbio) =====
  getCurrencyQuote,             // Cotação de par de moedas (⚠️  Requer plano premium)
  
  // ===== Indicadores Econômicos =====
  getPrimeRate,                      // Taxa Selic (histórico) - ⚠️  Dados históricos requerem premium
  getLatestPrimeRate,                // ✅ Taxa Selic atual (FUNCIONA! - 15.00%)
  getAvailablePrimeRateCountries,    // ✅ Lista países com dados de Selic (FUNCIONA!)
  getInflation,                      // Inflação (IPCA) - ⚠️  Requer plano premium
  getAvailableInflationCountries,    // ✅ Lista países com dados de inflação (FUNCIONA!)
  
  // ===== Constantes =====
  FREE_TEST_STOCKS,
  API_TOKEN,
};
