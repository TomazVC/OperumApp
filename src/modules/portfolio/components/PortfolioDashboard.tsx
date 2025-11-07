import React from 'react';
import {View, Text, TouchableOpacity, RefreshControl, ScrollView} from 'react-native';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';
import {PortfolioMetrics, RiskProfile, PortfolioSimulationMetrics, MarketData} from '../../../shared/types';
import {formatCurrency, formatPercentage} from '../../../shared/utils/formatters';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import {getRiskProfileDescription} from '../../authentication/services/riskProfileService';

interface PortfolioDashboardProps {
  metrics: PortfolioMetrics;
  simulationMetrics?: PortfolioSimulationMetrics;
  loading: boolean;
  error: string | null;
  riskProfile?: RiskProfile;
  onRefresh: () => void;
  onAddInvestment: () => void;
  marketData?: MarketData | null;
  marketDataLoading?: boolean;
  marketDataError?: string | null;
  lastUpdate?: Date | null;
  onRetry?: () => void;
}

const Container = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
  padding-horizontal: ${({theme}) => theme.spacing.lg}px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const Title = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 24px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h2.fontFamily};
`;

const AddButton = styled(Button)`
  padding-horizontal: ${({theme}) => theme.spacing.xs}px;
  padding-vertical: ${({theme}) => theme.spacing.xs / 2}px;
  min-height: 32px;
`;

const MetricsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

const MetricCard = styled(Card)<{isHighlight?: boolean; isCompact?: boolean}>`
  flex: 1;
  min-width: 150px;
  padding: ${({theme, isCompact}) => isCompact ? theme.spacing.sm : theme.spacing.md}px;
  ${({theme}) => theme.shadows.sm}
  ${({isHighlight, theme}) => isHighlight && `
    background-color: ${theme.colors.primary}10;
    border-width: 1px;
    border-color: ${theme.colors.primary}30;
  `}
`;

const MetricHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const MetricIcon = styled.View<{color: string; isCompact?: boolean}>`
  width: ${({isCompact}) => isCompact ? 24 : 32}px;
  height: ${({isCompact}) => isCompact ? 24 : 32}px;
  border-radius: ${({isCompact}) => isCompact ? 12 : 16}px;
  background-color: ${({color}) => color}20;
  justify-content: center;
  align-items: center;
  margin-right: ${({theme}) => theme.spacing.sm}px;
`;

const MetricTitle = styled.Text<{isCompact?: boolean}>`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: ${({isCompact}) => isCompact ? 10 : 12}px;
  font-weight: 500;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const MetricValue = styled.Text<{isHighlight?: boolean; isCompact?: boolean}>`
  color: ${({theme, isHighlight}) => 
    isHighlight ? theme.colors.primary : theme.colors.textDark};
  font-size: ${({isHighlight, isCompact}) => {
    if (isCompact) return '12px';
    return isHighlight ? '20px' : '16px';
  }};
  font-weight: ${({isHighlight}) => isHighlight ? '700' : '600'};
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const MetricChange = styled.Text<{isPositive: boolean; isCompact?: boolean}>`
  color: ${({theme, isPositive}) => 
    isPositive ? theme.colors.positive : theme.colors.negative};
  font-size: ${({isCompact}) => isCompact ? 10 : 12}px;
  font-weight: 500;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const LoadingContainer = styled.View`
  padding: ${({theme}) => theme.spacing.xl}px;
  align-items: center;
`;

const LoadingText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 14px;
  margin-top: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const ErrorContainer = styled.View`
  padding: ${({theme}) => theme.spacing.lg}px;
  background-color: ${({theme}) => theme.colors.error}10;
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.error}30;
  align-items: center;
`;

const ErrorText = styled.Text`
  color: ${({theme}) => theme.colors.error};
  font-size: 14px;
  text-align: center;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const RetryButton = styled(Button)`
  padding-horizontal: ${({theme}) => theme.spacing.md}px;
  padding-vertical: ${({theme}) => theme.spacing.sm}px;
`;

const ProfileCard = styled(Card)`
  margin-bottom: ${({theme}) => theme.spacing.md}px;
  background-color: #8B5CF6;
  ${({theme}) => theme.shadows.lg}
`;

const ProfileHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const ProfileIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  justify-content: center;
  align-items: center;
  margin-right: ${({theme}) => theme.spacing.sm}px;
`;

const ProfileTitle = styled.Text`
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const ProfileName = styled.Text`
  color: #FFFFFF;
  font-size: 20px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const ProfileDescription = styled.Text`
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  margin-top: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const DistributionSection = styled.View`
  margin-top: ${({theme}) => theme.spacing.md}px;
`;

const DistributionTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 16px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const DistributionItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${({theme}) => theme.spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({theme}) => theme.colors.border};
`;

const DistributionLabel = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
  flex-shrink: 1;
  margin-right: ${({theme}) => theme.spacing.md}px;
`;

const DistributionBarContainer = styled.View`
  width: 60px;
  height: 8px;
  background-color: ${({theme}) => theme.colors.border};
  border-radius: 4px;
  margin-right: ${({theme}) => theme.spacing.md}px;
  overflow: hidden;
`;

const DistributionBar = styled.View<{percentage: number; color: string}>`
  height: 100%;
  width: ${({percentage}) => percentage}%;
  background-color: ${({color}) => color};
  border-radius: 4px;
`;

const DistributionCategoryText = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  flex-shrink: 1;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const DistributionText = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 14px;
  font-weight: 600;
  min-width: 70px;
  text-align: right;
  margin-left: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  metrics,
  simulationMetrics,
  loading,
  error,
  riskProfile,
  onRefresh,
  onAddInvestment,
  marketData,
  marketDataLoading,
  marketDataError,
  lastUpdate,
  onRetry,
}) => {
  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Portfólio</Title>
        </Header>
        <LoadingContainer>
          <Ionicons name="trending-up-outline" size={32} color="#8B5CF6" />
          <LoadingText>Carregando dados do portfólio...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Portfólio</Title>
        </Header>
        <ErrorContainer>
          <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
          <ErrorText>{error}</ErrorText>
          <RetryButton 
            title="Tentar Novamente" 
            onPress={onRefresh}
            variant="secondary"
            size="small"
          />
        </ErrorContainer>
      </Container>
    );
  }

  // Usar métricas de simulação se disponíveis, senão usar métricas padrão
  const totalInvested = simulationMetrics?.totalInvested || metrics.totalInvested;
  const futureValue = simulationMetrics?.futureValue || metrics.totalValue;
  const expectedReturn = simulationMetrics?.expectedReturn || 0;
  const riskLevel = simulationMetrics?.riskLevel || 'Médio';
  const liquidityLevel = simulationMetrics?.liquidityLevel || 'Média';
  const accumulatedReturn = simulationMetrics?.accumulatedReturn || expectedReturn;

  const dashboardMetrics = [
    {
      title: 'Total Investido',
      value: formatCurrency(totalInvested),
      change: 0,
      icon: 'wallet-outline',
      color: '#8B5CF6',
      isHighlight: true,
    },
    {
      title: 'Valor Potencial Futuro',
      value: formatCurrency(futureValue),
      change: expectedReturn,
      icon: 'trending-up-outline',
      color: '#10B981',
      isHighlight: false,
    },
    {
      title: 'Rentabilidade Esperada',
      value: formatPercentage(expectedReturn),
      change: 0,
      icon: 'analytics-outline',
      color: '#8B5CF6',
      isHighlight: false,
    },
    {
      title: 'Risco da Carteira',
      value: riskLevel,
      change: 0,
      icon: 'shield-outline',
      color: riskLevel === 'Baixo' ? '#10B981' : riskLevel === 'Médio' ? '#F59E0B' : '#EF4444',
      isHighlight: false,
    },
    {
      title: 'Liquidez',
      value: liquidityLevel,
      change: 0,
      icon: 'cash-outline',
      color: liquidityLevel === 'Alta' ? '#10B981' : liquidityLevel === 'Média' ? '#F59E0B' : '#EF4444',
      isHighlight: false,
    },
    {
      title: 'Rentabilidade Acumulada',
      value: formatPercentage(accumulatedReturn),
      change: 0,
      icon: 'stats-chart-outline',
      color: '#10B981',
      isHighlight: false,
    },
  ];

  const categoryColors: Record<string, string> = {
    'Renda Fixa': '#10B981',
    'Fundos': '#8B5CF6',
    'Renda Variável': '#EF4444',
  };

  return (
    <Container>
      <Header>
        <Title>Portfólio</Title>
        <AddButton 
          title="Adicionar" 
          onPress={onAddInvestment}
          variant="gradient"
          size="small"
          icon={<Ionicons name="add" size={14} color="#FFFFFF" />}
        />
      </Header>

      {/* Card de Perfil do Investidor */}
      {riskProfile && (
        <ProfileCard>
          <ProfileHeader>
            <ProfileIcon>
              <Ionicons name="person-outline" size={20} color="#FFFFFF" />
            </ProfileIcon>
            <View>
              <ProfileTitle>Seu Perfil de Investidor</ProfileTitle>
              <ProfileName>{riskProfile}</ProfileName>
            </View>
          </ProfileHeader>
          <ProfileDescription>
            {getRiskProfileDescription(riskProfile)}
          </ProfileDescription>
        </ProfileCard>
      )}

      <MetricsGrid>
        {dashboardMetrics.map((metric, index) => (
          <MetricCard key={index} isHighlight={metric.isHighlight}>
            <MetricHeader>
              <MetricIcon color={metric.color}>
                <Ionicons 
                  name={metric.icon as any} 
                  size={16} 
                  color={metric.color} 
                />
              </MetricIcon>
              <MetricTitle>{metric.title}</MetricTitle>
            </MetricHeader>
            
            <MetricValue isHighlight={metric.isHighlight}>
              {metric.value}
            </MetricValue>
            
            {metric.change !== 0 && (
              <MetricChange isPositive={metric.change > 0}>
                {metric.change > 0 ? '+' : ''}{formatPercentage(metric.change)}
              </MetricChange>
            )}
          </MetricCard>
        ))}

        {/* Indicadores de Mercado Compactos */}
        {marketData && !marketDataLoading && !marketDataError && (
          <>
            <MetricCard isCompact>
              <MetricHeader>
                <MetricIcon color="#8B5CF6" isCompact>
                  <Ionicons name="trending-up-outline" size={12} color="#8B5CF6" />
                </MetricIcon>
                <MetricTitle isCompact>Ibovespa</MetricTitle>
              </MetricHeader>
              <MetricValue isCompact>{formatCurrency(marketData.ibovespa.value)}</MetricValue>
              {marketData.ibovespa.changePercent !== 0 && (
                <MetricChange isPositive={marketData.ibovespa.changePercent > 0} isCompact>
                  {marketData.ibovespa.changePercent > 0 ? '+' : ''}{formatPercentage(marketData.ibovespa.changePercent)}
                </MetricChange>
              )}
            </MetricCard>

            <MetricCard isCompact>
              <MetricHeader>
                <MetricIcon color="#10B981" isCompact>
                  <Ionicons name="cash-outline" size={12} color="#10B981" />
                </MetricIcon>
                <MetricTitle isCompact>Dólar</MetricTitle>
              </MetricHeader>
              <MetricValue isCompact>R$ {marketData.dolar.value.toFixed(2)}</MetricValue>
              {marketData.dolar.changePercent !== 0 && (
                <MetricChange isPositive={marketData.dolar.changePercent > 0} isCompact>
                  {marketData.dolar.changePercent > 0 ? '+' : ''}{formatPercentage(marketData.dolar.changePercent)}
                </MetricChange>
              )}
            </MetricCard>

            <MetricCard isCompact>
              <MetricHeader>
                <MetricIcon color="#EF4444" isCompact>
                  <Ionicons name="trending-down-outline" size={12} color="#EF4444" />
                </MetricIcon>
                <MetricTitle isCompact>Selic</MetricTitle>
              </MetricHeader>
              <MetricValue isCompact>{marketData.selic.toFixed(2)}%</MetricValue>
            </MetricCard>

            <MetricCard isCompact>
              <MetricHeader>
                <MetricIcon color="#F59E0B" isCompact>
                  <Ionicons name="bar-chart-outline" size={12} color="#F59E0B" />
                </MetricIcon>
                <MetricTitle isCompact>IPCA</MetricTitle>
              </MetricHeader>
              <MetricValue isCompact>{marketData.ipca.toFixed(2)}%</MetricValue>
            </MetricCard>
          </>
        )}
      </MetricsGrid>

      {/* Gráfico de Distribuição */}
      {simulationMetrics && simulationMetrics.distributionByCategory.length > 0 && (
        <DistributionSection>
          <DistributionTitle>Distribuição por Categoria</DistributionTitle>
          <Card variant="elevated" padding>
            {simulationMetrics.distributionByCategory.map((dist, index) => (
              <DistributionItem key={index}>
                <DistributionLabel>
                  <DistributionBarContainer>
                    <DistributionBar 
                      percentage={dist.percentage} 
                      color={categoryColors[dist.category] || '#8B5CF6'}
                    />
                  </DistributionBarContainer>
                  <DistributionCategoryText numberOfLines={1}>
                    {dist.category}
                  </DistributionCategoryText>
                </DistributionLabel>
                <DistributionText>{formatPercentage(dist.percentage)}</DistributionText>
              </DistributionItem>
            ))}
          </Card>
        </DistributionSection>
      )}
    </Container>
  );
};

export default PortfolioDashboard;
