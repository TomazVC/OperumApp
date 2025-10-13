import axios, {AxiosInstance, AxiosResponse} from 'axios';

// Configuração da API IBGE
const BASE_URL = 'https://servicodados.ibge.gov.br/api/v3';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas (IPCA é mensal)

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
    console.error('IBGE API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Interface para resposta da API IBGE
interface IBGEResponse {
  id: number;
  nome: string;
  series: Array<{
    id: number;
    nome: string;
    codigo: string;
    unidade: {
      id: number;
      nome: string;
      sigla: string;
    };
    valores: Array<{
      id: number;
      data: string;
      valor: string;
    }>;
  }>;
}

// Função para buscar IPCA (Índice Nacional de Preços ao Consumidor Amplo)
export const getIPCA = async (): Promise<number> => {
  const cacheKey = 'ipca_rate';
  const cached = getCachedData<number>(cacheKey);
  if (cached) return cached;

  try {
    // ID do agregado IPCA: 1737
    // ID da variável IPCA: 63
    const response = await api.get<IBGEResponse>('/agregados/1737/periodos/-1/variaveis/63');
    
    if (!response.data || !response.data.series || response.data.series.length === 0) {
      throw new Error('Dados do IPCA não encontrados');
    }

    const series = response.data.series[0];
    if (!series.valores || series.valores.length === 0) {
      throw new Error('Valores do IPCA não encontrados');
    }

    // Pegar o último valor disponível
    const lastValue = series.valores[series.valores.length - 1];
    const result = parseFloat(lastValue.valor) || 0;

    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Erro ao buscar IPCA via IBGE API, usando dados mockados');
    return generateMockIPCA();
  }
};

// Função para buscar IPCA dos últimos 12 meses
export const getIPCA12Months = async (): Promise<Array<{month: string; value: number}>> => {
  const cacheKey = 'ipca_12_months';
  const cached = getCachedData<Array<{month: string; value: number}>>(cacheKey);
  if (cached) return cached;

  try {
    // Buscar dados dos últimos 12 meses
    const response = await api.get<IBGEResponse>('/agregados/1737/periodos/-12/variaveis/63');
    
    if (!response.data || !response.data.series || response.data.series.length === 0) {
      throw new Error('Dados do IPCA dos últimos 12 meses não encontrados');
    }

    const series = response.data.series[0];
    if (!series.valores || series.valores.length === 0) {
      throw new Error('Valores do IPCA dos últimos 12 meses não encontrados');
    }

    const result = series.valores.map(valor => ({
      month: valor.data,
      value: parseFloat(valor.valor) || 0,
    }));

    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Erro ao buscar IPCA dos últimos 12 meses via IBGE API, usando dados mockados');
    return generateMockIPCA12Months();
  }
};

// Função para buscar dados econômicos gerais do IBGE
export const getEconomicIndicators = async (): Promise<{
  ipca: number;
  ipca12Months: Array<{month: string; value: number}>;
  lastUpdate: string;
}> => {
  const cacheKey = 'economic_indicators';
  const cached = getCachedData<{
    ipca: number;
    ipca12Months: Array<{month: string; value: number}>;
    lastUpdate: string;
  }>(cacheKey);
  if (cached) return cached;

  try {
    const [ipca, ipca12Months] = await Promise.all([
      getIPCA(),
      getIPCA12Months(),
    ]);

    const result = {
      ipca,
      ipca12Months,
      lastUpdate: new Date().toISOString(),
    };

    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Erro ao buscar indicadores econômicos via IBGE API, usando dados mockados');
    return generateMockEconomicIndicators();
  }
};

// Funções auxiliares para dados mockados
const generateMockIPCA = (): number => {
  return Number((4.0 + Math.random() * 2).toFixed(2));
};

const generateMockIPCA12Months = (): Array<{month: string; value: number}> => {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const month = date.toISOString().substring(0, 7); // YYYY-MM format
    const value = 4.0 + Math.random() * 2;
    months.push({
      month,
      value: Number(value.toFixed(2)),
    });
  }
  
  return months;
};

const generateMockEconomicIndicators = (): {
  ipca: number;
  ipca12Months: Array<{month: string; value: number}>;
  lastUpdate: string;
} => ({
  ipca: 4.0 + Math.random() * 2,
  ipca12Months: generateMockIPCA12Months(),
  lastUpdate: new Date().toISOString(),
});

export default {
  getIPCA,
  getIPCA12Months,
  getEconomicIndicators,
};
