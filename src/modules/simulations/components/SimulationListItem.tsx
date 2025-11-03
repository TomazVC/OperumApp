import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {PieChart} from 'react-native-chart-kit';
import Button from '../../../shared/components/Button';

type AllocationItem = { label: string; value: number; color: string };

type Props = {
  name: string;
  date: string;
  expectedReturnPct: number;
  totalValue?: number;
  allocation: AllocationItem[];
  onReopen: () => void;
  onDuplicate: () => void;
};

const Card = styled.View`
  background-color: ${({theme}) => theme.colors.surface};
  border-radius: ${({theme}) => theme.borderRadius.lg}px;
  padding: ${({theme}) => theme.spacing.md}px;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
  ${({theme}) => theme.shadows.sm}
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 16px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const Sub = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 12px;
  margin-top: 2px;
`;

const KPIs = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 8px;
`;

const KPI = styled.Text`
  color: ${({theme}) => theme.colors.text};
  font-size: 12px;
`;

const Actions = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 12px;
`;

const SimulationListItem: React.FC<Props> = ({
  name,
  date,
  expectedReturnPct,
  totalValue,
  allocation,
  onReopen,
  onDuplicate,
}) => {
  const chartData = allocation.map((a, idx) => ({
    name: a.label,
    population: a.value,
    color: a.color,
    legendFontColor: '#6B7280',
    legendFontSize: 10,
  }));

  return (
    <Card>
      <Row>
        <View style={{flex: 1}}>
          <Title>{name}</Title>
          <Sub>{date}</Sub>
          <KPIs>
            <KPI>Retorno: {expectedReturnPct.toFixed(2)}%</KPI>
            {typeof totalValue === 'number' && <KPI>Valor: R$ {totalValue.toFixed(2)}</KPI>}
          </KPIs>
        </View>
        <PieChart
          data={chartData}
          width={140}
          height={110}
          chartConfig={{
            color: () => '#8B5CF6',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
          }}
          accessor="population"
          backgroundColor="transparent"
          hasLegend={false}
          paddingLeft="0"
          center={[0, 0]}
        />
      </Row>
      <Actions>
        <Button title="Reabrir" onPress={onReopen} size="small" variant="secondary" />
        <Button title="Duplicar" onPress={onDuplicate} size="small" variant="secondary" />
      </Actions>
    </Card>
  );
};

export default SimulationListItem;


