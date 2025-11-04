import React, {useState, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';
import Card from '../../../shared/components/Card';
import Input from '../../../shared/components/Input';
import SimulationSlider from './SimulationSlider';
import SimulationChart from './SimulationChart';
import {
  calculateCompoundInterestWithMonthlyDeposits,
  generateChartData,
  SimulationParams,
} from '../services/financialCalculationService';
import {formatCurrency} from '../../../shared/utils/formatters';

interface FinancialSimulationProps {
  portfolioExpectedReturn?: number;
  renderChartFirst?: boolean;
}

const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background};
`;

const Content = styled.View`
  padding: ${({theme}) => theme.spacing.lg}px;
`;

const Section = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.xl}px;
`;

const SectionTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 18px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const InputContainer = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const SimulationCard = styled(Card)`
  padding: ${({theme}) => theme.spacing.lg}px;
`;

const ResultsContainer = styled.View`
  margin-top: ${({theme}) => theme.spacing.lg}px;
`;

const ResultsGrid = styled.View`
  flex-direction: column;
  gap: ${({theme}) => theme.spacing.lg}px;
`;

const ResultsRow = styled.View`
  flex-direction: row;
  gap: ${({theme}) => theme.spacing.md}px;
`;

const HighlightCard = styled(Card)`
  padding: ${({theme}) => theme.spacing.lg}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 2px;
  border-color: ${({theme}) => theme.colors.primary};
  border-style: solid;
  ${({theme}) => theme.shadows.md}
`;

const ResultCard = styled(Card)<{highlight?: boolean}>`
  flex: 1;
  padding: ${({theme}) => theme.spacing.lg}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: ${({highlight}) => (highlight ? 2 : 1)}px;
  border-color: ${({theme, highlight}) =>
    highlight ? theme.colors.primary : theme.colors.border};
  border-style: solid;
  ${({theme}) => theme.shadows.sm}
`;

const ResultTitle = styled.Text<{highlight?: boolean}>`
  color: ${({theme, highlight}) =>
    highlight ? theme.colors.primary : theme.colors.textDark};
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const ResultValue = styled.Text<{highlight?: boolean}>`
  color: ${({theme, highlight}) =>
    highlight ? theme.colors.primary : theme.colors.textDark};
  font-size: ${({highlight}) => (highlight ? 28 : 22)}px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h2.fontFamily};
`;

const EducationalMessage = styled(Card)`
  background-color: ${({theme}) => theme.colors.background};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  border-style: solid;
  margin-top: ${({theme}) => theme.spacing.lg}px;
  padding: ${({theme}) => theme.spacing.md}px;
`;

const MessageText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 18px;
  font-family: ${({theme}) => theme.typography.caption.fontFamily};
`;

const FinancialSimulation: React.FC<FinancialSimulationProps> = ({
  portfolioExpectedReturn = 10,
  renderChartFirst = false,
}) => {
  const [initialValue, setInitialValue] = useState<string>('10000');
  const [monthlyDeposit, setMonthlyDeposit] = useState<string>('500');
  const [years, setYears] = useState<number>(5);
  const [annualReturn, setAnnualReturn] = useState<number>(portfolioExpectedReturn);

  // Atualizar retorno quando portfolioExpectedReturn mudar
  useEffect(() => {
    if (portfolioExpectedReturn > 0) {
      setAnnualReturn(portfolioExpectedReturn);
    }
  }, [portfolioExpectedReturn]);

  // Converter strings para números
  const initialValueNum = useMemo(() => {
    const cleaned = initialValue.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }, [initialValue]);

  const monthlyDepositNum = useMemo(() => {
    const cleaned = monthlyDeposit.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }, [monthlyDeposit]);

  // Calcular simulação
  const simulationResult = useMemo(() => {
    if (initialValueNum <= 0 || years <= 0) {
      return null;
    }

    const params: SimulationParams = {
      initialValue: initialValueNum,
      monthlyDeposit: monthlyDepositNum,
      annualReturnPercent: annualReturn,
      years,
    };

    return calculateCompoundInterestWithMonthlyDeposits(params);
  }, [initialValueNum, monthlyDepositNum, annualReturn, years]);

  // Gerar dados para gráfico
  const chartData = useMemo(() => {
    if (!simulationResult) {
      return {labels: [], values: []};
    }

    return generateChartData(simulationResult.monthlyValues, years);
  }, [simulationResult, years]);

  const handleInitialValueChange = (text: string) => {
    const cleaned = text.replace(/[^\d,.-]/g, '').replace(',', '.');
    setInitialValue(cleaned);
  };

  const handleMonthlyDepositChange = (text: string) => {
    const cleaned = text.replace(/[^\d,.-]/g, '').replace(',', '.');
    setMonthlyDeposit(cleaned);
  };

  return (
    <Container>
      <Content>
          {/* Gráfico primeiro se solicitado */}
          {renderChartFirst && chartData.labels.length > 0 && (
            <Section>
              <SimulationChart
                data={chartData.values}
                labels={chartData.labels}
                years={years}
              />
            </Section>
          )}

          {/* Simulação Financeira */}
          <Section>
            <SectionTitle>Simulação</SectionTitle>
            <SimulationCard variant="elevated">
              <InputContainer>
                <Input
                  label="Valor Inicial (R$)"
                  placeholder="Ex: 10.000,00"
                  keyboardType="numeric"
                  value={initialValue}
                  onChangeText={handleInitialValueChange}
                  icon="wallet-outline"
                />
              </InputContainer>

              <InputContainer>
                <Input
                  label="Aporte Mensal (R$) - Opcional"
                  placeholder="Ex: 500,00"
                  keyboardType="numeric"
                  value={monthlyDeposit}
                  onChangeText={handleMonthlyDepositChange}
                  icon="add-circle-outline"
                />
              </InputContainer>

              <View style={{marginTop: 8}}>
                <SimulationSlider
                  label="Período"
                  value={years}
                  minimumValue={1}
                  maximumValue={30}
                  step={1}
                  onValueChange={setYears}
                  formatValue={(val) => `${val} ${val === 1 ? 'ano' : 'anos'}`}
                />
              </View>

              <View style={{marginTop: 8}}>
                <SimulationSlider
                  label="Retorno Esperado Anual"
                  value={annualReturn}
                  minimumValue={0}
                  maximumValue={30}
                  step={0.1}
                  onValueChange={setAnnualReturn}
                  formatValue={(val) => `${val.toFixed(1)}%`}
                />
              </View>
            </SimulationCard>
          </Section>

          {/* Resultados */}
          {simulationResult && (
            <Section>
              <ResultsContainer>
                <ResultsGrid>
                  <HighlightCard variant="elevated">
                    <ResultTitle highlight>Valor Final Projetado</ResultTitle>
                    <ResultValue highlight>
                      {formatCurrency(simulationResult.finalValue)}
                    </ResultValue>
                  </HighlightCard>

                  <ResultsRow>
                    <ResultCard variant="elevated">
                      <ResultTitle>Total Aportado</ResultTitle>
                      <ResultValue>
                        {formatCurrency(simulationResult.totalInvested)}
                      </ResultValue>
                    </ResultCard>

                    <ResultCard variant="elevated">
                      <ResultTitle>Rendimento Total</ResultTitle>
                      <ResultValue
                        style={{
                          color:
                            simulationResult.totalReturn > 0
                              ? '#10B981'
                              : simulationResult.totalReturn < 0
                              ? '#EF4444'
                              : '#374151',
                        }}>
                        {simulationResult.totalReturn >= 0 ? '+' : ''}
                        {formatCurrency(simulationResult.totalReturn)}
                      </ResultValue>
                    </ResultCard>
                  </ResultsRow>
                </ResultsGrid>
              </ResultsContainer>
            </Section>
          )}

          {/* Gráfico depois da simulação se não renderizado primeiro */}
          {!renderChartFirst && chartData.labels.length > 0 && (
            <Section>
              <SimulationChart
                data={chartData.values}
                labels={chartData.labels}
                years={years}
              />
            </Section>
          )}

          {/* Mensagem Educativa */}
          <EducationalMessage variant="outlined">
            <MessageText>
              Esta projeção é baseada em retornos constantes. Resultados reais podem
              variar conforme as condições de mercado.
            </MessageText>
          </EducationalMessage>
        </Content>
      </Container>
  );
};

export default FinancialSimulation;
