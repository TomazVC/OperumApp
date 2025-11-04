import React, {useState, useEffect, useMemo} from 'react';
import {View, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
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
import {formatCurrency, formatPercentage} from '../../../shared/utils/formatters';

interface FinancialSimulationProps {
  portfolioExpectedReturn?: number;
}

const Container = styled(ScrollView)`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background};
`;

const ScrollContent = styled.View`
  padding: ${({theme}) => theme.spacing.lg}px;
`;

const Section = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.xl}px;
`;

const SectionTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 22px;
  font-weight: 700;
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const InputContainer = styled.View`
  flex: 1;
`;

const ResultsContainer = styled.View`
  margin-top: ${({theme}) => theme.spacing.md}px;
`;

const ResultsGrid = styled.View`
  flex-direction: column;
  gap: ${({theme}) => theme.spacing.lg}px;
`;

const ResultsRow = styled.View`
  flex-direction: row;
  gap: ${({theme}) => theme.spacing.md}px;
`;

const ResultCard = styled(Card)<{highlight?: boolean}>`
  flex: 1;
  min-width: 150px;
  background-color: ${({theme, highlight}) =>
    highlight ? theme.colors.primary + '12' : theme.colors.surface};
  border-width: ${({highlight}) => (highlight ? 2.5 : 1)}px;
  border-color: ${({theme, highlight}) =>
    highlight ? theme.colors.primary : theme.colors.border};
  border-style: solid;
  position: relative;
  overflow: hidden;
  padding: ${({theme}) => theme.spacing.lg}px;
`;

const ResultCardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const ResultIcon = styled.View<{highlight?: boolean}>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({theme, highlight}) =>
    highlight ? theme.colors.primary + '20' : theme.colors.background};
  justify-content: center;
  align-items: center;
  margin-right: ${({theme}) => theme.spacing.sm}px;
`;

const ResultTitleContainer = styled.View`
  flex: 1;
`;

const ResultTitle = styled.Text<{highlight?: boolean}>`
  color: ${({theme, highlight}) =>
    highlight ? theme.colors.primary : theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const ResultValue = styled.Text<{highlight?: boolean}>`
  color: ${({theme, highlight}) =>
    highlight ? theme.colors.primary : theme.colors.textDark};
  font-size: ${({highlight}) => (highlight ? 30 : 20)}px;
  font-weight: 700;
  margin-top: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.h2.fontFamily};
`;

const EducationalMessage = styled(Card)`
  background-color: ${({theme}) => theme.colors.primary + '10'};
  border-left-width: 4px;
  border-left-color: ${({theme}) => theme.colors.primary};
  border-style: solid;
  margin-top: ${({theme}) => theme.spacing.xl}px;
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const MessageContent = styled.View`
  flex-direction: row;
  align-items: flex-start;
`;

const MessageIcon = styled.View`
  margin-right: ${({theme}) => theme.spacing.md}px;
  margin-top: 2px;
`;

const MessageText = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 14px;
  line-height: 22px;
  flex: 1;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const MessageTextBold = styled.Text`
  font-weight: 600;
  margin-bottom: 4px;
`;

const FinancialSimulation: React.FC<FinancialSimulationProps> = ({
  portfolioExpectedReturn = 10,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <Container>
        <ScrollContent>
          <Section>
            <SectionTitle>Simulação Financeira</SectionTitle>
            <Card variant="elevated" padding>
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

              <InputContainer style={{marginTop: 16}}>
                <Input
                  label="Aporte Mensal (R$) - Opcional"
                  placeholder="Ex: 500,00"
                  keyboardType="numeric"
                  value={monthlyDeposit}
                  onChangeText={handleMonthlyDepositChange}
                  icon="add-circle-outline"
                />
              </InputContainer>

              <SimulationSlider
                label="Período"
                value={years}
                minimumValue={1}
                maximumValue={30}
                step={1}
                onValueChange={setYears}
                formatValue={(val) => `${val} ${val === 1 ? 'ano' : 'anos'}`}
              />

              <SimulationSlider
                label="Retorno Esperado Anual"
                value={annualReturn}
                minimumValue={0}
                maximumValue={30}
                step={0.1}
                onValueChange={setAnnualReturn}
                formatValue={(val) => formatPercentage(val)}
              />
            </Card>
          </Section>

          {simulationResult && (
            <>
              <Section>
                <SectionTitle>Resultados da Simulação</SectionTitle>
                <ResultsContainer>
                  <ResultsGrid>
                    <ResultCard variant="elevated" highlight>
                      <ResultCardHeader>
                        <ResultIcon highlight>
                          <Ionicons
                            name="trending-up"
                            size={26}
                            color="#8B5CF6"
                          />
                        </ResultIcon>
                        <ResultTitleContainer>
                          <ResultTitle highlight>Valor Final Acumulado</ResultTitle>
                        </ResultTitleContainer>
                      </ResultCardHeader>
                      <ResultValue highlight>
                        {formatCurrency(simulationResult.finalValue)}
                      </ResultValue>
                    </ResultCard>

                    <ResultsRow>
                      <ResultCard variant="elevated">
                        <ResultCardHeader>
                          <ResultIcon>
                            <Ionicons
                              name="wallet"
                              size={22}
                              color="#6B7280"
                            />
                          </ResultIcon>
                          <ResultTitleContainer>
                            <ResultTitle>Total Aportado</ResultTitle>
                          </ResultTitleContainer>
                        </ResultCardHeader>
                        <ResultValue>
                          {formatCurrency(simulationResult.totalInvested)}
                        </ResultValue>
                      </ResultCard>

                      <ResultCard variant="elevated">
                        <ResultCardHeader>
                          <ResultIcon>
                            <Ionicons
                              name="stats-chart"
                              size={22}
                              color={simulationResult.totalReturn > 0 ? '#10B981' : '#EF4444'}
                            />
                          </ResultIcon>
                          <ResultTitleContainer>
                            <ResultTitle>Rendimento Total</ResultTitle>
                          </ResultTitleContainer>
                        </ResultCardHeader>
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

              {chartData.labels.length > 0 && (
                <SimulationChart
                  data={chartData.values}
                  labels={chartData.labels}
                  years={years}
                />
              )}
            </>
          )}

          <EducationalMessage variant="outlined" padding>
            <MessageContent>
              <MessageIcon>
                <Ionicons name="information-circle" size={22} color="#8B5CF6" />
              </MessageIcon>
              <View style={{flex: 1}}>
                <MessageTextBold>Importante:</MessageTextBold>
                <MessageText>
                  Esta é uma projeção baseada em retornos constantes. Resultados reais
                  podem variar conforme as condições de mercado e o desempenho real dos
                  investimentos.
                </MessageText>
              </View>
            </MessageContent>
          </EducationalMessage>
        </ScrollContent>
      </Container>
    </KeyboardAvoidingView>
  );
};

export default FinancialSimulation;

