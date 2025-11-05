import {
  AssetCategory,
  AssetRisk,
  AssetLiquidity,
  RecommendedAsset,
  RecommendedPortfolio,
  PortfolioSimulationMetrics,
  RiskProfile,
  PortfolioItem,
} from '../../../shared/types';
import {portfolioService} from './portfolioService';
import brapiService from '../../../core/api/brapiService';

// Catálogo de ativos (mock em memória)
const ASSET_CATALOG: RecommendedAsset[] = [
  // Renda Fixa
  {
    name: 'Tesouro Selic',
    category: 'Renda Fixa',
    risk: 'Baixo',
    liquidity: 'Alta',
    expectedReturn: 10.5,
    justification: 'Título público mais seguro do país, indexado à taxa Selic. Ideal para reserva de emergência.',
  },
  {
    name: 'Tesouro IPCA+',
    category: 'Renda Fixa',
    risk: 'Baixo',
    liquidity: 'Média',
    expectedReturn: 6.5,
    justification: 'Protege contra inflação com taxa fixa adicional. Pode ter volatilidade antes do vencimento.',
  },
  {
    name: 'CDB',
    category: 'Renda Fixa',
    risk: 'Baixo',
    liquidity: 'Média',
    expectedReturn: 11.0,
    justification: 'Certificado de depósito bancário com cobertura do FGC até R$ 250.000.',
  },
  {
    name: 'LCI',
    category: 'Renda Fixa',
    risk: 'Baixo',
    liquidity: 'Baixa',
    expectedReturn: 10.0,
    justification: 'Isento de IR para pessoa física, financia setor imobiliário.',
  },
  {
    name: 'LCA',
    category: 'Renda Fixa',
    risk: 'Baixo',
    liquidity: 'Baixa',
    expectedReturn: 10.0,
    justification: 'Isento de IR para pessoa física, financia agronegócio.',
  },
  // Fundos
  {
    name: 'Fundo DI',
    category: 'Fundos',
    risk: 'Baixo',
    liquidity: 'Alta',
    expectedReturn: 9.5,
    justification: 'Fundos de renda fixa que acompanham o CDI. Boa para começar a investir.',
  },
  {
    name: 'Fundo Multimercado',
    category: 'Fundos',
    risk: 'Médio',
    liquidity: 'Média',
    expectedReturn: 12.0,
    justification: 'Diversifica entre diferentes classes de ativos, oferecendo equilíbrio entre risco e retorno.',
  },
  {
    name: 'Fundo de Ações',
    category: 'Fundos',
    risk: 'Alto',
    liquidity: 'Média',
    expectedReturn: 15.0,
    justification: 'Exposição diversificada ao mercado de ações com gestão profissional.',
  },
  // Renda Variável
  {
    name: 'PETR4',
    category: 'Renda Variável',
    risk: 'Médio',
    liquidity: 'Alta',
    expectedReturn: 13.0,
    justification: 'Ação da Petrobras, uma das maiores empresas brasileiras com histórico de dividendos.',
  },
  {
    name: 'VALE3',
    category: 'Renda Variável',
    risk: 'Médio',
    liquidity: 'Alta',
    expectedReturn: 14.0,
    justification: 'Ação da Vale, líder mundial em mineração de ferro.',
  },
  {
    name: 'ITUB4',
    category: 'Renda Variável',
    risk: 'Médio',
    liquidity: 'Alta',
    expectedReturn: 12.5,
    justification: 'Ação de banco com bom histórico de dividendos e estabilidade.',
  },
  {
    name: 'FII HGLG11',
    category: 'Renda Variável',
    risk: 'Médio',
    liquidity: 'Média',
    expectedReturn: 11.5,
    justification: 'Fundo imobiliário focado em galpões logísticos, setor em crescimento.',
  },
  {
    name: 'FII XPLG11',
    category: 'Renda Variável',
    risk: 'Médio',
    liquidity: 'Média',
    expectedReturn: 10.5,
    justification: 'Fundo imobiliário diversificado, oferece renda mensal isenta de IR.',
  },
  {
    name: 'ETF BOVA11',
    category: 'Renda Variável',
    risk: 'Médio',
    liquidity: 'Alta',
    expectedReturn: 12.0,
    justification: 'ETF que replica o Ibovespa, diversificação automática nas principais ações.',
  },
];

// Cache em memória com o conjunto mais recente de ativos carregados dinamicamente
let allAssetsCache: RecommendedAsset[] = [];

// Mapeamento de categoria para assetType (compatibilidade)
const CATEGORY_TO_ASSET_TYPE: Record<AssetCategory, string> = {
  'Renda Fixa': 'Renda Fixa',
  'Fundos': 'Fundos',
  'Renda Variável': 'Renda Variável',
};

// Percentuais recomendados por perfil
const PROFILE_DISTRIBUTIONS: Record<RiskProfile, {category: AssetCategory; percentage: number}[]> = {
  Conservador: [
    {category: 'Renda Fixa', percentage: 70},
    {category: 'Fundos', percentage: 20},
    {category: 'Renda Variável', percentage: 10},
  ],
  Moderado: [
    {category: 'Renda Fixa', percentage: 40},
    {category: 'Fundos', percentage: 30},
    {category: 'Renda Variável', percentage: 30},
  ],
  Agressivo: [
    {category: 'Renda Fixa', percentage: 20},
    {category: 'Fundos', percentage: 30},
    {category: 'Renda Variável', percentage: 50},
  ],
};

// Ativos recomendados por perfil
const PROFILE_RECOMMENDATIONS: Record<RiskProfile, string[]> = {
  Conservador: ['Tesouro Selic', 'Tesouro IPCA+', 'CDB', 'LCI', 'LCA', 'Fundo DI'],
  Moderado: ['CDB', 'Fundo Multimercado', 'FII HGLG11', 'FII XPLG11', 'ETF BOVA11', 'PETR4'],
  Agressivo: ['Fundo de Ações', 'PETR4', 'VALE3', 'ITUB4', 'FII HGLG11', 'ETF BOVA11'],
};

// Função para mapear dados da Brapi para RecommendedAsset
function mapBrapiStockToRecommendedAsset(brapiStock: any): RecommendedAsset {
  // Mapear categoria baseado no tipo
  let category: AssetCategory;
  if (brapiStock.type === 'fund') {
    category = 'Fundos';
  } else if (brapiStock.type === 'stock' || brapiStock.type === 'bdr') {
    category = 'Renda Variável';
  } else {
    category = 'Renda Variável'; // Default
  }

  // Inferir liquidez baseado no volume
  let liquidity: AssetLiquidity;
  const volume = brapiStock.volume || 0;
  if (volume > 100000000) { // Mais de 100 milhões
    liquidity = 'Alta';
  } else if (volume > 10000000) { // Mais de 10 milhões
    liquidity = 'Média';
  } else {
    liquidity = 'Baixa';
  }

  // Inferir risco baseado em volatilidade (change) e volume
  let risk: AssetRisk;
  const changePercent = Math.abs(brapiStock.change || 0);
  const hasHighVolume = volume > 50000000;
  
  if (changePercent > 5 && !hasHighVolume) {
    risk = 'Alto';
  } else if (changePercent > 2 || !hasHighVolume) {
    risk = 'Médio';
  } else {
    risk = 'Baixo';
  }

  // Estimar expectedReturn baseado em:
  // - Média histórica de ações brasileiras: ~10-15%
  // - Ajustar baseado no setor e volume
  let expectedReturn = 12.0; // Base
  if (brapiStock.type === 'fund') {
    expectedReturn = 10.5; // FIIs geralmente têm retorno mais conservador
  } else if (hasHighVolume && brapiStock.market_cap && brapiStock.market_cap > 10000000000) {
    expectedReturn = 13.5; // Grandes empresas com alta liquidez
  }

  // Gerar justificativa baseada nos dados
  const marketCapText = brapiStock.market_cap 
    ? `Valor de mercado de R$ ${(brapiStock.market_cap / 1000000000).toFixed(1)} bilhões. `
    : '';
  const sectorText = brapiStock.sector ? `Setor: ${brapiStock.sector}. ` : '';
  const typeText = brapiStock.type === 'fund' 
    ? 'Fundo imobiliário que oferece renda mensal isenta de IR. '
    : brapiStock.type === 'bdr'
    ? 'BDR (Brazilian Depositary Receipt) que representa ações de empresas estrangeiras. '
    : 'Ação negociada na B3. ';
  
  const justification = `${typeText}${marketCapText}${sectorText}${liquidity === 'Alta' ? 'Alta liquidez no mercado.' : 'Liquidez moderada.'}`.trim();

  return {
    name: brapiStock.stock,
    category,
    risk,
    liquidity,
    expectedReturn,
    justification,
  };
}

export const portfolioSimulationService = {
  // Catálogo de ativos
  getAllAssets(): RecommendedAsset[] {
    return ASSET_CATALOG;
  },

  getAssetsByCategory(category: AssetCategory): RecommendedAsset[] {
    return ASSET_CATALOG.filter(asset => asset.category === category);
  },

  getAssetByName(name: string): RecommendedAsset | undefined {
    if (!name) return undefined;

    // Busca exata no catálogo estático
    const fromStatic = ASSET_CATALOG.find(asset => asset.name === name);
    if (fromStatic) return fromStatic;

    // Busca case-insensitive no cache dinâmico
    const lower = name.toLowerCase();
    const fromCache = allAssetsCache.find(a => a.name.toLowerCase() === lower);
    if (fromCache) return fromCache;

    // Fallback seguro: permitir inserção de qualquer ticker/ativo
    return {
      name,
      category: 'Renda Variável',
      risk: 'Médio',
      liquidity: 'Alta',
      expectedReturn: 10,
      justification: 'Ativo adicionado manualmente.'
    } as RecommendedAsset;
  },

  // Buscar ativos dinamicamente da Brapi
  async getAssetsFromBrapi(options?: {
    type?: 'stock' | 'fund' | 'bdr';
    search?: string;
    limit?: number;
  }): Promise<RecommendedAsset[]> {
    try {
      const response = await brapiService.getStockList({
        type: options?.type,
        search: options?.search,
        limit: options?.limit || 100,
        sortBy: 'volume',
        sortOrder: 'desc',
      });

      if (!response.stocks || !Array.isArray(response.stocks)) {
        return [];
      }

      // Mapear cada ação da Brapi para RecommendedAsset
      return response.stocks.map(mapBrapiStockToRecommendedAsset);
    } catch (error) {
      console.error('Erro ao buscar ativos da Brapi:', error);
      // Retornar array vazio em caso de erro
      return [];
    }
  },

  // Função combinada: Retorna catálogo estático + ativos dinâmicos
  async getAllAssetsCombined(options?: {
    includeStatic?: boolean;
    includeBrapi?: boolean;
    brapiType?: 'stock' | 'fund' | 'bdr';
    limit?: number;
  }): Promise<RecommendedAsset[]> {
    const assets: RecommendedAsset[] = [];

    // Adicionar catálogo estático (Renda Fixa)
    if (options?.includeStatic !== false) {
      assets.push(...ASSET_CATALOG.filter(a => a.category === 'Renda Fixa'));
    }

    // Adicionar ativos da Brapi (Renda Variável e Fundos)
    if (options?.includeBrapi !== false) {
      try {
        const brapiAssets = await this.getAssetsFromBrapi({
          type: options?.brapiType,
          limit: options?.limit || 200,
        });
        assets.push(...brapiAssets);
      } catch (error) {
        console.warn('Falha ao buscar ativos da Brapi, usando apenas catálogo estático');
        // Adicionar ativos estáticos de Renda Variável como fallback
        if (options?.includeStatic !== false) {
          assets.push(...ASSET_CATALOG.filter(a => 
            a.category === 'Renda Variável' || a.category === 'Fundos'
          ));
        }
      }
    } else if (options?.includeStatic !== false) {
      // Se não incluir Brapi, adicionar todos os ativos estáticos
      assets.push(...ASSET_CATALOG);
    }

    // Atualiza cache global com o conjunto mais recente
    allAssetsCache = assets;
    return assets;
  },

  // Recomendações baseadas em perfil
  getRecommendedPortfolio(riskProfile: RiskProfile): RecommendedPortfolio {
    const distribution = PROFILE_DISTRIBUTIONS[riskProfile];
    const recommendedAssetNames = PROFILE_RECOMMENDATIONS[riskProfile];
    const recommendedAssets = recommendedAssetNames
      .map(name => this.getAssetByName(name))
      .filter((asset): asset is RecommendedAsset => asset !== undefined);

    return {
      profile: riskProfile,
      distribution,
      recommendedAssets,
    };
  },

  // Métricas da carteira simulada
  calculatePortfolioMetrics(userId: number, portfolioItems: PortfolioItem[]): PortfolioSimulationMetrics {
    // Filtrar apenas itens simulados (isDemo = 1)
    const simulatedItems = portfolioItems.filter(item => item.isDemo === 1);

    // Calcular total investido
    const totalInvested = simulatedItems.reduce((sum, item) => {
      if (item.quantity && item.unitPrice) {
        return sum + item.quantity * item.unitPrice;
      }
      return sum + item.amount;
    }, 0);

    // Calcular rentabilidade esperada (média ponderada)
    let weightedReturn = 0;
    if (totalInvested > 0) {
      simulatedItems.forEach(item => {
        const itemValue = item.quantity && item.unitPrice 
          ? item.quantity * item.unitPrice 
          : item.amount;
        const expectedReturn = item.expectedReturn || 0;
        weightedReturn += (itemValue / totalInvested) * expectedReturn;
      });
    }

    // Calcular valor futuro (projeção 1 ano)
    const futureValue = totalInvested * (1 + weightedReturn / 100);

    // Calcular distribuição por categoria
    const distributionByCategory: {category: AssetCategory; amount: number; percentage: number}[] = [];
    const categoryTotals = new Map<AssetCategory, number>();

    simulatedItems.forEach(item => {
      const asset = this.getAssetByName(item.assetName);
      const category = asset?.category || (item.assetType as AssetCategory) || 'Renda Fixa';
      const itemValue = item.quantity && item.unitPrice 
        ? item.quantity * item.unitPrice 
        : item.amount;
      
      const currentTotal = categoryTotals.get(category) || 0;
      categoryTotals.set(category, currentTotal + itemValue);
    });

    categoryTotals.forEach((amount, category) => {
      distributionByCategory.push({
        category,
        amount,
        percentage: totalInvested > 0 ? (amount / totalInvested) * 100 : 0,
      });
    });

    // Calcular nível de risco (média ponderada)
    let weightedRisk = 0;
    if (totalInvested > 0) {
      simulatedItems.forEach(item => {
        const asset = this.getAssetByName(item.assetName);
        const itemValue = item.quantity && item.unitPrice 
          ? item.quantity * item.unitPrice 
          : item.amount;
        const riskValue = asset ? (asset.risk === 'Baixo' ? 1 : asset.risk === 'Médio' ? 2 : 3) : 2;
        weightedRisk += (itemValue / totalInvested) * riskValue;
      });
    }
    const riskLevel: AssetRisk = weightedRisk <= 1.5 ? 'Baixo' : weightedRisk <= 2.5 ? 'Médio' : 'Alto';

    // Calcular nível de liquidez (média ponderada)
    let weightedLiquidity = 0;
    if (totalInvested > 0) {
      simulatedItems.forEach(item => {
        const asset = this.getAssetByName(item.assetName);
        const itemValue = item.quantity && item.unitPrice 
          ? item.quantity * item.unitPrice 
          : item.amount;
        const liquidityValue = asset ? (asset.liquidity === 'Alta' ? 3 : asset.liquidity === 'Média' ? 2 : 1) : 2;
        weightedLiquidity += (itemValue / totalInvested) * liquidityValue;
      });
    }
    const liquidityLevel: AssetLiquidity = weightedLiquidity >= 2.5 ? 'Alta' : weightedLiquidity >= 1.5 ? 'Média' : 'Baixa';

    // Rentabilidade acumulada simulada (baseada na rentabilidade esperada)
    const accumulatedReturn = weightedReturn;

    return {
      totalInvested,
      futureValue,
      expectedReturn: weightedReturn,
      riskLevel,
      liquidityLevel,
      accumulatedReturn,
      distributionByCategory,
    };
  },

  // Adicionar ativo à simulação
  addAssetToSimulation(
    userId: number,
    assetName: string,
    quantity: number,
    unitPrice: number
  ): number {
    const asset = this.getAssetByName(assetName);
    if (!asset) {
      throw new Error(`Ativo ${assetName} não encontrado no catálogo`);
    }

    const amount = quantity * unitPrice;
    const expectedReturn = asset.expectedReturn;

    return portfolioService.addPortfolioItem({
      userId,
      assetName,
      assetType: CATEGORY_TO_ASSET_TYPE[asset.category],
      amount,
      isDemo: 1, // Identifica como simulação
      quantity,
      unitPrice,
      expectedReturn,
    });
  },

  // Atualizar ativo na simulação
  updateSimulatedAsset(
    portfolioItemId: number,
    quantity: number,
    unitPrice: number
  ): void {
    const amount = quantity * unitPrice;
    portfolioService.updatePortfolioItem(portfolioItemId, {
      quantity,
      unitPrice,
      amount,
    });
  },

  // Remover ativo da simulação
  removeSimulatedAsset(portfolioItemId: number): void {
    portfolioService.removePortfolioItem(portfolioItemId);
  },

  // Projeção futura (simples)
  getProjectionMetrics(portfolioItems: PortfolioItem[], years: number = 1): number[] {
    const metrics = this.calculatePortfolioMetrics(
      portfolioItems[0]?.userId || 0,
      portfolioItems
    );
    
    const projections: number[] = [metrics.totalInvested];
    const annualReturn = metrics.expectedReturn / 100;
    
    for (let i = 1; i <= years; i++) {
      const previousValue = projections[i - 1];
      projections.push(previousValue * (1 + annualReturn));
    }
    
    return projections;
  },
};

