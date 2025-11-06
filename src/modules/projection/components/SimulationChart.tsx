import React from 'react';
import {View, Dimensions} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import styled from 'styled-components/native';
import Card from '../../../shared/components/Card';
import {formatCurrency} from '../../../shared/utils/formatters';

interface SimulationChartProps {
  data: number[];
  labels: string[];
  years: number;
}

const {width: screenWidth} = Dimensions.get('window');
// Cálculo da largura considerando:
// - 48px = padding do Content (24px × 2, theme.spacing.lg)
// - 32px = padding do ChartCard (16px × 2, theme.spacing.md)
// - 8px = margem de segurança extra para labels e marcadores
const chartWidth = screenWidth - 88;

const ChartContainer = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.xl}px;
`;

const ChartCard = styled(Card)`
  padding: ${({theme}) => theme.spacing.md}px;
`;

const ChartLegend = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: ${({theme}) => theme.spacing.sm}px;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
`;

const LegendDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #8B5CF6;
  margin-right: ${({theme}) => theme.spacing.xs}px;
`;

const LegendText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 12px;
  font-family: ${({theme}) => theme.typography.caption.fontFamily};
`;

const SimulationChart: React.FC<SimulationChartProps> = ({
  data,
  labels,
  years,
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Preparar dados para o gráfico
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, // #8B5CF6
        strokeWidth: 3,
      },
    ],
    legend: ['Valor Acumulado'],
  };

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, // Cor primária
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`, // textDark
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#8B5CF6',
      fill: '#FFFFFF',
    },
    formatYLabel: (value: string) => {
      const numValue = parseFloat(value);
      if (numValue >= 1000000) {
        return `R$ ${(numValue / 1000000).toFixed(1)}M`;
      } else if (numValue >= 1000) {
        return `R$ ${(numValue / 1000).toFixed(1)}k`;
      }
      return `R$ ${numValue.toFixed(0)}`;
    },
  };

  return (
    <ChartContainer>
      <ChartCard variant="elevated" padding>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withDots={true}
          withShadow={false}
          segments={4}
        />
        <ChartLegend>
          <LegendDot />
          <LegendText>Evolução do Patrimônio</LegendText>
        </ChartLegend>
      </ChartCard>
    </ChartContainer>
  );
};

export default SimulationChart;

