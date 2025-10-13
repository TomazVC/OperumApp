import React from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';
import {MarketData} from '../../../shared/types';
import {formatCurrency, formatPercentage} from '../../../shared/utils/formatters';
import Card from '../../../shared/components/Card';

interface MarketIndicatorsProps {
  data: MarketData | null;
  loading: boolean;
  error: string | null;
  lastUpdate?: Date | null;
  onRetry?: () => void;
}

const Container = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const Title = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 18px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const IndicatorsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

const IndicatorCard = styled(Card)`
  flex: 1;
  min-width: 150px;
  align-items: center;
  padding: ${({theme}) => theme.spacing.md}px;
  ${({theme}) => theme.shadows.sm}
`;

const IndicatorIcon = styled.View<{color: string}>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({color}) => color}20;
  justify-content: center;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const IndicatorName = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const IndicatorValue = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 16px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const IndicatorChange = styled.Text<{isPositive: boolean}>`
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

const ErrorContainer = styled.View`
  padding: ${({theme}) => theme.spacing.lg}px;
  background-color: ${({theme}) => theme.colors.error}10;
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.error}30;
`;

const ErrorText = styled.Text`
  color: ${({theme}) => theme.colors.error};
  font-size: 14px;
  text-align: center;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const RetryButton = styled.TouchableOpacity`
  background-color: ${({theme}) => theme.colors.error};
  padding: ${({theme}) => theme.spacing.sm}px ${({theme}) => theme.spacing.md}px;
  border-radius: ${({theme}) => theme.borderRadius.sm}px;
  align-self: center;
`;

const RetryButtonText = styled.Text`
  color: ${({theme}) => theme.colors.white};
  font-size: 12px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const LastUpdateText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 11px;
  text-align: center;
  margin-top: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const LoadingSkeleton = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

const SkeletonCard = styled(Card)`
  flex: 1;
  min-width: 150px;
  height: 100px;
  align-items: center;
  justify-content: center;
  padding: ${({theme}) => theme.spacing.md}px;
`;

const MarketIndicators: React.FC<MarketIndicatorsProps> = ({
  data,
  loading,
  error,
  lastUpdate,
  onRetry,
}) => {
  const formatLastUpdate = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container>
        <Title>Indicadores de Mercado</Title>
        <LoadingSkeleton>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} variant="elevated">
              <ActivityIndicator size="small" color="#8B5CF6" />
            </SkeletonCard>
          ))}
        </LoadingSkeleton>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Indicadores de Mercado</Title>
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          {onRetry && (
            <RetryButton onPress={onRetry}>
              <RetryButtonText>Tentar Novamente</RetryButtonText>
            </RetryButton>
          )}
        </ErrorContainer>
      </Container>
    );
  }

  if (!data) {
    return null;
  }

  const indicators = [
    {
      name: 'Ibovespa',
      value: formatCurrency(data.ibovespa.value),
      change: data.ibovespa.changePercent,
      icon: 'trending-up-outline',
      color: '#8B5CF6',
    },
    {
      name: 'Dólar',
      value: `R$ ${data.dolar.value.toFixed(2)}`,
      change: data.dolar.changePercent,
      icon: 'cash-outline',
      color: '#10B981',
    },
    {
      name: 'Selic',
      value: `${data.selic.toFixed(2)}%`,
      change: 0, // Selic não tem variação diária
      icon: 'trending-down-outline',
      color: '#EF4444',
    },
    {
      name: 'IPCA',
      value: `${data.ipca.toFixed(2)}%`,
      change: 0, // IPCA não tem variação diária
      icon: 'bar-chart-outline',
      color: '#F59E0B',
    },
  ];

  return (
    <Container>
      <Title>Indicadores de Mercado</Title>
      <IndicatorsGrid>
        {indicators.map((indicator, index) => (
          <IndicatorCard key={index} variant="elevated">
            <IndicatorIcon color={indicator.color}>
              <Ionicons 
                name={indicator.icon as any} 
                size={20} 
                color={indicator.color} 
              />
            </IndicatorIcon>
            <IndicatorName>{indicator.name}</IndicatorName>
            <IndicatorValue>{indicator.value}</IndicatorValue>
            {indicator.change !== 0 && (
              <IndicatorChange isPositive={indicator.change > 0}>
                {indicator.change > 0 ? '+' : ''}{formatPercentage(indicator.change)}
              </IndicatorChange>
            )}
          </IndicatorCard>
        ))}
      </IndicatorsGrid>
      {lastUpdate && (
        <LastUpdateText>
          Última atualização: {formatLastUpdate(lastUpdate)}
        </LastUpdateText>
      )}
    </Container>
  );
};

export default MarketIndicators;
