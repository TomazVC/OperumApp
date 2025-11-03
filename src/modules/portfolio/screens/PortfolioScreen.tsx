import React, {useState, useEffect, useCallback} from 'react';
import {View, Alert, Text, ScrollView, RefreshControl} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {RootStackNavigationProp} from '../../../core/navigation/types';
import {useAuth} from '../../../shared/hooks/useAuth';
import {PortfolioItem, StockPosition, PortfolioMetrics, RiskProfile, RecommendedPortfolio} from '../../../shared/types';
import {portfolioService} from '../services/portfolioService';
import {portfolioSimulationService} from '../services/portfolioSimulationService';
import {useMarketData} from '../../../shared/hooks/useMarketData';
import PortfolioDashboard from '../components/PortfolioDashboard';
import AIRecommendations from '../components/AIRecommendations';
import AssetSelector from '../components/AssetSelector';
import MarketIndicators from '../components/MarketIndicators';
import StockCard from '../components/StockCard';
import PerformanceChart from '../components/PerformanceChart';
import Button from '../../../shared/components/Button';
import Container from '../../../shared/components/Container';
import IconButton from '../../../shared/components/IconButton';
import Card from '../../../shared/components/Card';
import {formatCurrency} from '../../../shared/utils/formatters';

const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background};
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${({theme}) => theme.spacing.lg}px;
  background-color: ${({theme}) => theme.colors.surface};
  ${({theme}) => theme.shadows.sm}
`;

const WelcomeText = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 20px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const ActionContainer = styled.View`
  flex-direction: row;
  gap: ${({theme}) => theme.spacing.sm}px;
  align-items: center;
`;

const ConnectionStatus = styled.View<{isOnline: boolean}>`
  flex-direction: row;
  align-items: center;
  background-color: ${({isOnline}) => isOnline ? '#10B981' : '#EF4444'}20;
  padding-horizontal: ${({theme}) => theme.spacing.sm}px;
  padding-vertical: ${({theme}) => theme.spacing.xs}px;
  border-radius: ${({theme}) => theme.borderRadius.sm}px;
  margin-right: ${({theme}) => theme.spacing.sm}px;
`;

const ConnectionText = styled.Text<{isOnline: boolean}>`
  color: ${({isOnline}) => isOnline ? '#10B981' : '#EF4444'};
  font-size: 10px;
  font-weight: 600;
  margin-left: 4px;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const ContentContainer = styled(ScrollView)`
  flex: 1;
  padding: ${({theme}) => theme.spacing.lg}px;
`;

const SectionTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 18px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const StocksContainer = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const EmptyState = styled.View`
  align-items: center;
  padding: ${({theme}) => theme.spacing.xl}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-radius: ${({theme}) => theme.borderRadius.lg}px;
  ${({theme}) => theme.shadows.sm}
`;

const EmptyStateIcon = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${({theme}) => theme.colors.primary}20;
  justify-content: center;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const EmptyStateText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 16px;
  text-align: center;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const EmptyStateSubtext = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const SimulatedAssetCard = styled(Card)`
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  padding: ${({theme}) => theme.spacing.md}px;
`;

const SimulatedAssetHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
`;

const SimulatedAssetName = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const SimulatedAssetValue = styled.Text`
  color: ${({theme}) => theme.colors.primary};
  font-size: 16px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const SimulatedAssetDetails = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: ${({theme}) => theme.spacing.xs}px;
  gap: 12px;
`;

const SimulatedAssetActions = styled.View`
  flex-direction: row;
  margin-top: ${({theme}) => theme.spacing.sm}px;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

const PortfolioScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {user, signOut} = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [stockPositions, setStockPositions] = useState<StockPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [showAssetSelector, setShowAssetSelector] = useState(false);

  // Hook para dados de mercado
  const {
    marketData,
    marketDataLoading,
    marketDataError,
    stockQuotes,
    stockQuotesLoading,
    stockQuotesError,
    lastUpdate,
    isOnline,
    refreshAll,
    refreshStockQuote,
    retryFailedRequests,
  } = useMarketData();

  const loadPortfolio = useCallback(() => {
    if (!user) return;

    try {
      setIsLoading(true);
      let items = portfolioService.getUserPortfolio(user.id);

      // Se não há itens, cria um portfólio padrão
      if (items.length === 0) {
        portfolioService.createDefaultPortfolio(user.id);
        items = portfolioService.getUserPortfolio(user.id);
      }

      setPortfolioItems(items);

      // Converter para StockPosition com dados reais das cotações
      const positions: StockPosition[] = items.map((item, index) => {
        const quote = stockQuotes.get(item.assetName);
        const basePrice = 50 + Math.random() * 100; // Preço médio de compra simulado
        const currentPrice = quote?.price || basePrice + (Math.random() - 0.5) * 20;
        const quantity = Math.floor(Math.random() * 100) + 10;
        const totalValue = currentPrice * quantity;
        const profitLoss = totalValue - (basePrice * quantity);
        const profitLossPercent = (profitLoss / (basePrice * quantity)) * 100;

        return {
          ticker: item.assetName,
          quantity,
          averagePrice: basePrice,
          currentPrice,
          totalValue,
          profitLoss,
          profitLossPercent,
          change: quote?.change || currentPrice - basePrice,
          changePercent: quote?.changePercent || ((currentPrice - basePrice) / basePrice) * 100,
        };
      });

      setStockPositions(positions);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o portfólio');
    } finally {
      setIsLoading(false);
    }
  }, [user, stockQuotes]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  // Carregar cotações das ações do portfólio
  useEffect(() => {
    if (portfolioItems.length > 0) {
      portfolioItems.forEach(item => {
        if (!stockQuotes.has(item.assetName)) {
          refreshStockQuote(item.assetName);
        }
      });
    }
  }, [portfolioItems, stockQuotes, refreshStockQuote]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadPortfolio(),
      refreshAll(),
    ]);
    setRefreshing(false);
  }, [loadPortfolio, refreshAll]);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Sair', onPress: signOut},
      ]
    );
  };

  const handleChatbot = () => {
    navigation.navigate('Chatbot');
  };

  const handleAddInvestment = () => {
    setShowAssetSelector(true);
  };

  const handleOpenSimulationHistory = () => {
    navigation.navigate('SimulationHistory');
  };

  const handleAssetSelect = (assetName: string, quantity: number, unitPrice: number) => {
    if (!user) return;
    
    try {
      portfolioSimulationService.addAssetToSimulation(user.id, assetName, quantity, unitPrice);
      loadPortfolio();
      Alert.alert('Sucesso', 'Ativo adicionado à carteira simulada!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível adicionar o ativo');
    }
  };

  const handleApplyRecommendation = (recommendedPortfolio: RecommendedPortfolio) => {
    Alert.alert(
      'Aplicar Recomendação',
      'Esta ação irá criar uma carteira simulada com base na recomendação. Deseja continuar?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Aplicar',
          onPress: () => {
            // Por enquanto, apenas mostra mensagem
            Alert.alert('Em breve', 'A aplicação automática da recomendação será implementada em breve');
          },
        },
      ]
    );
  };

  const handleRemoveSimulatedAsset = (itemId: number) => {
    Alert.alert(
      'Remover Ativo',
      'Tem certeza que deseja remover este ativo da carteira simulada?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            try {
              portfolioSimulationService.removeSimulatedAsset(itemId);
              loadPortfolio();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível remover o ativo');
            }
          },
        },
      ]
    );
  };

  // Calcular métricas do portfólio
  const portfolioMetrics: PortfolioMetrics = {
    totalValue: stockPositions.reduce((sum, pos) => sum + pos.totalValue, 0),
    totalInvested: stockPositions.reduce((sum, pos) => sum + (pos.averagePrice * pos.quantity), 0),
    profitLoss: stockPositions.reduce((sum, pos) => sum + pos.profitLoss, 0),
    profitLossPercent: 0, // Calculado abaixo
    dailyChange: stockPositions.reduce((sum, pos) => sum + pos.change, 0),
    dailyChangePercent: 0, // Calculado abaixo
  };

  if (portfolioMetrics.totalInvested > 0) {
    portfolioMetrics.profitLossPercent = (portfolioMetrics.profitLoss / portfolioMetrics.totalInvested) * 100;
  }

  if (portfolioMetrics.totalValue > 0) {
    portfolioMetrics.dailyChangePercent = (portfolioMetrics.dailyChange / portfolioMetrics.totalValue) * 100;
  }

  // Dados mockados para o gráfico de performance
  const chartData = [100, 102, 98, 105, 110, 108, 115, 112, 118, 120, 125, 122];

  const totalValue = portfolioItems.reduce((sum, item) => sum + item.amount, 0);

  // Calcular métricas de simulação
  const simulatedItems = portfolioItems.filter(item => item.isDemo === 1);
  const simulationMetrics = simulatedItems.length > 0
    ? portfolioSimulationService.calculatePortfolioMetrics(user?.id || 0, portfolioItems)
    : undefined;

  // Obter perfil de risco do usuário
  const riskProfile = user?.riskProfile as RiskProfile | undefined;

  return (
    <ScreenContainer>
      <HeaderContainer>
        <WelcomeText>Olá, {user?.name}</WelcomeText>
        <ActionContainer>
          <ConnectionStatus isOnline={isOnline}>
            <Ionicons 
              name={isOnline ? "wifi" : "wifi-off"} 
              size={12} 
              color={isOnline ? '#10B981' : '#EF4444'} 
            />
            <ConnectionText isOnline={isOnline}>
              {isOnline ? 'Online' : 'Offline'}
            </ConnectionText>
          </ConnectionStatus>
          <IconButton
            iconName="chatbubble-outline"
            iconLibrary="Ionicons"
            onPress={handleChatbot}
            variant="translucent"
            size="medium"
            color="#8B5CF6"
          />
          <IconButton
            iconName="log-out-outline"
            iconLibrary="Ionicons"
            onPress={handleLogout}
            variant="translucent"
            size="medium"
            color="#8B5CF6"
          />
        </ActionContainer>
      </HeaderContainer>

      <ContentContainer
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard de Métricas */}
        <PortfolioDashboard
          metrics={portfolioMetrics}
          simulationMetrics={simulationMetrics}
          loading={isLoading}
          error={null}
          riskProfile={riskProfile}
          onRefresh={handleRefresh}
          onAddInvestment={handleAddInvestment}
        />

        {/* Acesso ao Histórico de Simulações */}
        <View style={{marginBottom: 16}}>
          <Button
            title="Histórico de Simulações"
            onPress={handleOpenSimulationHistory}
            variant="secondary"
            size="large"
            icon={<Ionicons name="time-outline" size={20} color="#8B5CF6" />}
          />
        </View>

        {/* Sugestões da IA */}
        <AIRecommendations
          riskProfile={riskProfile}
          onApplyRecommendation={handleApplyRecommendation}
        />

        {/* Carteira Simulada */}
        {simulatedItems.length > 0 && (
          <StocksContainer>
            <SectionTitle>Carteira Simulada</SectionTitle>
            {simulatedItems.map((item) => {
              const asset = portfolioSimulationService.getAssetByName(item.assetName);
              const itemValue = item.quantity && item.unitPrice
                ? item.quantity * item.unitPrice
                : item.amount;

              return (
                <SimulatedAssetCard key={item.id} variant="elevated">
                  <SimulatedAssetHeader>
                    <SimulatedAssetName>{item.assetName}</SimulatedAssetName>
                    <SimulatedAssetValue>{formatCurrency(itemValue)}</SimulatedAssetValue>
                  </SimulatedAssetHeader>
                  {asset && (
                    <SimulatedAssetDetails>
                      <Text style={{fontSize: 12, color: '#6B7280'}}>
                        {asset.category} • Risco: {asset.risk} • Liquidez: {asset.liquidity}
                      </Text>
                    </SimulatedAssetDetails>
                  )}
                  {(item.quantity || item.unitPrice) && (
                    <SimulatedAssetDetails>
                      {item.quantity && (
                        <Text style={{fontSize: 12, color: '#6B7280'}}>
                          Quantidade: {item.quantity.toFixed(2)}
                        </Text>
                      )}
                      {item.unitPrice && (
                        <Text style={{fontSize: 12, color: '#6B7280'}}>
                          Preço Unitário: {formatCurrency(item.unitPrice)}
                        </Text>
                      )}
                      {item.expectedReturn && (
                        <Text style={{fontSize: 12, color: '#10B981'}}>
                          Rentabilidade: {item.expectedReturn.toFixed(2)}%
                        </Text>
                      )}
                    </SimulatedAssetDetails>
                  )}
                  <SimulatedAssetActions>
                    <Button
                      title="Remover"
                      onPress={() => handleRemoveSimulatedAsset(item.id)}
                      variant="secondary"
                      size="small"
                      icon={<Ionicons name="trash-outline" size={14} color="#EF4444" />}
                      style={{flex: 1}}
                    />
                  </SimulatedAssetActions>
                </SimulatedAssetCard>
              );
            })}
          </StocksContainer>
        )}

        {/* Indicadores de Mercado */}
        <MarketIndicators
          data={marketData}
          loading={marketDataLoading}
          error={marketDataError}
          lastUpdate={lastUpdate}
          onRetry={retryFailedRequests}
        />

        {/* Gráfico de Performance */}
        <PerformanceChart
          data={chartData}
          period={chartPeriod}
          onPeriodChange={setChartPeriod}
          loading={isLoading}
        />

        {/* Lista de Ações */}
        <StocksContainer>
          <SectionTitle>Suas Ações</SectionTitle>
          {stockPositions.length > 0 ? (
            stockPositions.map((position, index) => (
              <StockCard
                key={index}
                position={position}
                quote={stockQuotes.get(position.ticker)}
                loading={stockQuotesLoading}
                lastUpdate={lastUpdate}
                onPress={() => {
                  // Navegar para detalhes da ação
                  Alert.alert('Em breve', `Detalhes de ${position.ticker} serão implementados`);
                }}
              />
            ))
          ) : (
            <EmptyState>
              <EmptyStateIcon>
                <Ionicons name="trending-up-outline" size={32} color="#8B5CF6" />
              </EmptyStateIcon>
              <EmptyStateText>Nenhum investimento encontrado</EmptyStateText>
              <EmptyStateSubtext>
                Comece adicionando suas primeiras ações ao portfólio
              </EmptyStateSubtext>
              <Button
                title="Adicionar Investimento"
                onPress={handleAddInvestment}
                variant="gradient"
                size="large"
                icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
              />
            </EmptyState>
          )}
        </StocksContainer>

        {/* Botão do Assistente removido (já existe no topo) */}
      </ContentContainer>

      {/* Modal de Seleção de Ativo */}
      <AssetSelector
        visible={showAssetSelector}
        onClose={() => setShowAssetSelector(false)}
        onSelect={handleAssetSelect}
      />
    </ScreenContainer>
  );
};

export default PortfolioScreen;
