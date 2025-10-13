import React from 'react';
import {View, Text, TouchableOpacity, RefreshControl, ScrollView} from 'react-native';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';
import {PortfolioMetrics} from '../../../shared/types';
import {formatCurrency, formatPercentage} from '../../../shared/utils/formatters';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';

interface PortfolioDashboardProps {
  metrics: PortfolioMetrics;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onAddInvestment: () => void;
}

const Container = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
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
  padding-horizontal: ${({theme}) => theme.spacing.sm}px;
  padding-vertical: ${({theme}) => theme.spacing.xs}px;
`;

const MetricsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

const MetricCard = styled(Card)<{isHighlight?: boolean}>`
  flex: 1;
  min-width: 150px;
  padding: ${({theme}) => theme.spacing.md}px;
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

const MetricIcon = styled.View<{color: string}>`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({color}) => color}20;
  justify-content: center;
  align-items: center;
  margin-right: ${({theme}) => theme.spacing.sm}px;
`;

const MetricTitle = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const MetricValue = styled.Text<{isHighlight?: boolean}>`
  color: ${({theme, isHighlight}) => 
    isHighlight ? theme.colors.primary : theme.colors.textDark};
  font-size: ${({isHighlight}) => isHighlight ? '20px' : '16px'};
  font-weight: ${({isHighlight}) => isHighlight ? '700' : '600'};
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const MetricChange = styled.Text<{isPositive: boolean}>`
  color: ${({theme, isPositive}) => 
    isPositive ? theme.colors.positive : theme.colors.negative};
  font-size: 12px;
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

const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  metrics,
  loading,
  error,
  onRefresh,
  onAddInvestment,
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

  const dashboardMetrics = [
    {
      title: 'Valor Total',
      value: formatCurrency(metrics.totalValue),
      change: metrics.dailyChangePercent,
      icon: 'wallet-outline',
      color: '#8B5CF6',
      isHighlight: true,
    },
    {
      title: 'Valor Investido',
      value: formatCurrency(metrics.totalInvested),
      change: 0,
      icon: 'trending-up-outline',
      color: '#10B981',
      isHighlight: false,
    },
    {
      title: 'Lucro/Prejuízo',
      value: formatCurrency(metrics.profitLoss),
      change: metrics.profitLossPercent,
      icon: 'analytics-outline',
      color: metrics.profitLoss >= 0 ? '#10B981' : '#EF4444',
      isHighlight: false,
    },
    {
      title: 'Variação Hoje',
      value: formatCurrency(metrics.dailyChange),
      change: metrics.dailyChangePercent,
      icon: 'today-outline',
      color: metrics.dailyChange >= 0 ? '#10B981' : '#EF4444',
      isHighlight: false,
    },
  ];

  return (
    <Container>
      <Header>
        <Title>Portfólio</Title>
        <AddButton 
          title="Adicionar" 
          onPress={onAddInvestment}
          variant="gradient"
          size="small"
          icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
        />
      </Header>

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
      </MetricsGrid>
    </Container>
  );
};

export default PortfolioDashboard;
