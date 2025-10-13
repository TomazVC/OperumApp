import {useState, useEffect, useCallback, useRef} from 'react';
import {MarketData, StockQuote, MarketIndex, NewsItem} from '../types';
import dadosMercadoAPI from '../../core/api/dadosMercadoService';

interface UseMarketDataReturn {
  // Dados de mercado
  marketData: MarketData | null;
  marketDataLoading: boolean;
  marketDataError: string | null;
  
  // Cotações de ações
  stockQuotes: Map<string, StockQuote>;
  stockQuotesLoading: boolean;
  stockQuotesError: string | null;
  
  // Notícias
  news: NewsItem[];
  newsLoading: boolean;
  newsError: string | null;
  
  // Timestamps
  lastUpdate: Date | null;
  isOnline: boolean;
  
  // Funções de atualização
  refreshMarketData: () => Promise<void>;
  refreshStockQuote: (ticker: string) => Promise<void>;
  refreshNews: () => Promise<void>;
  refreshAll: () => Promise<void>;
  retryFailedRequests: () => Promise<void>;
}

export const useMarketData = (): UseMarketDataReturn => {
  // Estados para dados de mercado
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [marketDataLoading, setMarketDataLoading] = useState(true);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);

  // Estados para cotações de ações
  const [stockQuotes, setStockQuotes] = useState<Map<string, StockQuote>>(new Map());
  const [stockQuotesLoading, setStockQuotesLoading] = useState(false);
  const [stockQuotesError, setStockQuotesError] = useState<string | null>(null);

  // Estados para notícias
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Estados para controle de atualização
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Refs para controlar intervalos
  const marketDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stockQuotesIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);

  // Função para buscar dados de mercado
  const refreshMarketData = useCallback(async () => {
    try {
      setMarketDataLoading(true);
      setMarketDataError(null);
      const data = await dadosMercadoAPI.getMacroIndicators();
      setMarketData(data);
      setLastUpdate(new Date());
      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados de mercado';
      setMarketDataError(errorMessage);
      console.error('Erro ao buscar dados de mercado:', error);
    } finally {
      setMarketDataLoading(false);
    }
  }, []);

  // Função para buscar cotação de uma ação
  const refreshStockQuote = useCallback(async (ticker: string) => {
    try {
      setStockQuotesLoading(true);
      setStockQuotesError(null);
      const quote = await dadosMercadoAPI.getStockQuote(ticker);
      setStockQuotes(prev => new Map(prev).set(ticker, quote));
      setLastUpdate(new Date());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar cotação';
      setStockQuotesError(errorMessage);
      console.error(`Erro ao buscar cotação de ${ticker}:`, error);
    } finally {
      setStockQuotesLoading(false);
    }
  }, []);

  // Função para buscar notícias
  const refreshNews = useCallback(async () => {
    try {
      setNewsLoading(true);
      setNewsError(null);
      const newsData = await dadosMercadoAPI.getNews(10);
      setNews(newsData);
      setLastUpdate(new Date());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar notícias';
      setNewsError(errorMessage);
      console.error('Erro ao buscar notícias:', error);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  // Função para atualizar todos os dados
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshMarketData(),
      refreshNews(),
    ]);
  }, [refreshMarketData, refreshNews]);

  // Função para tentar novamente requisições falhadas
  const retryFailedRequests = useCallback(async () => {
    if (retryCountRef.current >= 3) {
      console.warn('Máximo de tentativas de retry atingido');
      return;
    }

    retryCountRef.current += 1;
    console.log(`Tentativa de retry ${retryCountRef.current}/3`);

    const promises = [];
    if (marketDataError) promises.push(refreshMarketData());
    if (stockQuotesError) {
      // Retry all failed stock quotes
      const failedTickers = Array.from(stockQuotes.keys());
      promises.push(...failedTickers.map(ticker => refreshStockQuote(ticker)));
    }
    if (newsError) promises.push(refreshNews());

    await Promise.allSettled(promises);
  }, [marketDataError, stockQuotesError, newsError, refreshMarketData, refreshStockQuote, refreshNews]);

  // Função para verificar status de conexão
  const checkOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  // Configurar intervalos de atualização automática
  useEffect(() => {
    // Atualizar dados de mercado a cada 5 minutos
    marketDataIntervalRef.current = setInterval(() => {
      if (isOnline) {
        refreshMarketData();
      }
    }, 5 * 60 * 1000);

    // Atualizar cotações de ações a cada 60 segundos
    stockQuotesIntervalRef.current = setInterval(() => {
      if (isOnline && stockQuotes.size > 0) {
        const tickers = Array.from(stockQuotes.keys());
        tickers.forEach(ticker => refreshStockQuote(ticker));
      }
    }, 60 * 1000);

    // Verificar status de conexão
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      if (marketDataIntervalRef.current) {
        clearInterval(marketDataIntervalRef.current);
      }
      if (stockQuotesIntervalRef.current) {
        clearInterval(stockQuotesIntervalRef.current);
      }
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, [isOnline, refreshMarketData, refreshStockQuote, stockQuotes.size, checkOnlineStatus]);

  // Carregar dados iniciais
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    marketData,
    marketDataLoading,
    marketDataError,
    stockQuotes,
    stockQuotesLoading,
    stockQuotesError,
    news,
    newsLoading,
    newsError,
    lastUpdate,
    isOnline,
    refreshMarketData,
    refreshStockQuote,
    refreshNews,
    refreshAll,
    retryFailedRequests,
  };
};

// Hook específico para cotações de ações do portfólio
export const usePortfolioQuotes = (tickers: string[]) => {
  const {stockQuotes, stockQuotesLoading, stockQuotesError, refreshStockQuote} = useMarketData();

  // Atualizar cotações quando a lista de tickers mudar
  useEffect(() => {
    if (tickers.length > 0) {
      tickers.forEach(ticker => {
        if (!stockQuotes.has(ticker)) {
          refreshStockQuote(ticker);
        }
      });
    }
  }, [tickers, stockQuotes, refreshStockQuote]);

  // Retornar apenas as cotações dos tickers solicitados
  const portfolioQuotes = tickers.map(ticker => stockQuotes.get(ticker)).filter(Boolean) as StockQuote[];

  return {
    quotes: portfolioQuotes,
    loading: stockQuotesLoading,
    error: stockQuotesError,
    refreshQuote: refreshStockQuote,
  };
};

export default useMarketData;
