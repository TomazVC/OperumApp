import React from 'react';
import {View, Text, TouchableOpacity, Dimensions} from 'react-native';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';
import Card from '../../../shared/components/Card';

interface PerformanceChartProps {
  data: number[];
  period: '1D' | '1W' | '1M' | '3M' | '1Y';
  onPeriodChange: (period: '1D' | '1W' | '1M' | '3M' | '1Y') => void;
  loading?: boolean;
}

const {width: screenWidth} = Dimensions.get('window');

const Container = styled(Card)`
  padding: ${({theme}) => theme.spacing.lg}px;
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
  ${({theme}) => theme.shadows.sm}
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const Title = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 18px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const PeriodSelector = styled.View`
  flex-direction: row;
  background-color: ${({theme}) => theme.colors.background};
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  padding: 2px;
`;


const PeriodButtonText = styled.Text<{active: boolean}>`
  color: ${({active, theme}) => 
    active ? theme.colors.textLight : theme.colors.textSecondary};
  font-size: 12px;
  font-weight: ${({active}) => active ? '600' : '500'};
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const ChartContainer = styled.View`
  height: 200px;
  justify-content: center;
  align-items: center;
  background-color: ${({theme}) => theme.colors.background};
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const ChartPlaceholder = styled.View`
  width: ${screenWidth - 80}px;
  height: 150px;
  background-color: ${({theme}) => theme.colors.primary}10;
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.primary}20;
`;

const ChartIcon = styled(Ionicons)`
  color: ${({theme}) => theme.colors.primary};
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const ChartText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
  font-family: ${({theme}) => theme.typography?.body?.fontFamily || 'System'};
`;

const StatsContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatValue = styled.Text<{isPositive: boolean}>`
  color: ${({theme, isPositive}) => 
    isPositive ? theme.colors.positive : theme.colors.negative};
  font-size: 16px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography?.h4?.fontFamily || 'System'};
`;

const StatLabel = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
  margin-top: 2px;
  font-family: ${({theme}) => theme.typography?.small?.fontFamily || 'System'};
`;

const LoadingContainer = styled.View`
  height: 200px;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 14px;
  margin-top: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography?.body?.fontFamily || 'System'};
`;

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  period,
  onPeriodChange,
  loading = false,
}) => {
  const periods = [
    {key: '1D' as const, label: '1D'},
    {key: '1W' as const, label: '1W'},
    {key: '1M' as const, label: '1M'},
    {key: '3M' as const, label: '3M'},
    {key: '1Y' as const, label: '1Y'},
  ];

  // Calcular estatísticas básicas
  const currentValue = data[data.length - 1] || 0;
  const previousValue = data[data.length - 2] || 0;
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  
  const dailyChange = currentValue - previousValue;
  const dailyChangePercent = previousValue > 0 ? (dailyChange / previousValue) * 100 : 0;
  const totalChange = currentValue - (data[0] || 0);
  const totalChangePercent = data[0] > 0 ? (totalChange / data[0]) * 100 : 0;

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Performance</Title>
        </Header>
        <LoadingContainer>
          <Ionicons name="trending-up-outline" size={32} color="#8B5CF6" />
          <LoadingText>Carregando dados de performance...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Performance</Title>
        <PeriodSelector>
          {periods.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => onPeriodChange(p.key)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: period === p.key ? '#8B5CF6' : 'transparent',
              }}
            >
              <PeriodButtonText active={period === p.key}>
                {p.label}
              </PeriodButtonText>
            </TouchableOpacity>
          ))}
        </PeriodSelector>
      </Header>

      <ChartContainer>
        <ChartPlaceholder>
          <ChartIcon name="bar-chart-outline" size={48} />
          <ChartText>
            Gráfico de performance{'\n'}
            (Implementação futura com react-native-chart-kit)
          </ChartText>
        </ChartPlaceholder>
      </ChartContainer>

      <StatsContainer>
        <StatItem>
          <StatValue isPositive={dailyChange >= 0}>
            {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)}%
          </StatValue>
          <StatLabel>Hoje</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue isPositive={totalChange >= 0}>
            {totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
          </StatValue>
          <StatLabel>Período</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue isPositive={true}>
            {maxValue.toFixed(2)}
          </StatValue>
          <StatLabel>Máxima</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue isPositive={false}>
            {minValue.toFixed(2)}
          </StatValue>
          <StatLabel>Mínima</StatLabel>
        </StatItem>
      </StatsContainer>
    </Container>
  );
};

export default PerformanceChart;
