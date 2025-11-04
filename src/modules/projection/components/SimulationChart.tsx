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
const chartWidth = screenWidth - 48; // Padding lateral

const ChartContainer = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const ChartTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 18px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const ChartCard = styled(Card)`
  padding: ${({theme}) => theme.spacing.md}px;
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
      <ChartTitle>Evolução do Patrimônio</ChartTitle>
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
      </ChartCard>
    </ChartContainer>
  );
};

export default SimulationChart;

