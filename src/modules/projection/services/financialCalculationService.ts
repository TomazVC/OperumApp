export interface SimulationResult {
  monthlyValues: number[];
  totalInvested: number;
  totalReturn: number;
  finalValue: number;
}

export interface SimulationParams {
  initialValue: number;
  monthlyDeposit: number;
  annualReturnPercent: number;
  years: number;
}

/**
 * Calcula juros compostos com aportes mensais
 * 
 * @param initialValue - Valor inicial investido
 * @param monthlyDeposit - Aporte mensal (opcional)
 * @param annualReturnPercent - Retorno anual esperado em porcentagem (ex: 10 para 10%)
 * @param years - Período em anos
 * @returns Objeto com valores mensais e totais
 */
export const calculateCompoundInterestWithMonthlyDeposits = (
  params: SimulationParams
): SimulationResult => {
  const {initialValue, monthlyDeposit, annualReturnPercent, years} = params;
  
  // Converter taxa anual para mensal
  // taxa_mensal = (1 + taxa_anual)^(1/12) - 1
  const annualRate = annualReturnPercent / 100;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  
  // Array para armazenar valores mensais
  const monthlyValues: number[] = [initialValue];
  
  // Calcular valor para cada mês
  const totalMonths = years * 12;
  for (let month = 1; month <= totalMonths; month++) {
    const previousValue = monthlyValues[month - 1];
    // Aplicar juros e adicionar aporte mensal
    const newValue = previousValue * (1 + monthlyRate) + monthlyDeposit;
    monthlyValues.push(newValue);
  }
  
  // Calcular totais
  const finalValue = monthlyValues[monthlyValues.length - 1];
  const totalInvested = initialValue + monthlyDeposit * totalMonths;
  const totalReturn = finalValue - totalInvested;
  
  return {
    monthlyValues,
    totalInvested,
    totalReturn,
    finalValue,
  };
};

/**
 * Gera dados para gráfico (amostragem por ano para melhor performance)
 */
export const generateChartData = (
  monthlyValues: number[],
  years: number
): {labels: string[]; values: number[]} => {
  const labels: string[] = [];
  const values: number[] = [];
  
  // Incluir valor inicial
  labels.push('0');
  values.push(monthlyValues[0]);
  
  // Amostrar um ponto por ano (12 meses)
  for (let year = 1; year <= years; year++) {
    const monthIndex = year * 12;
    if (monthIndex < monthlyValues.length) {
      labels.push(year.toString());
      values.push(monthlyValues[monthIndex]);
    }
  }
  
  // Incluir valor final se não estiver incluído
  const lastIndex = monthlyValues.length - 1;
  const lastYear = Math.floor(lastIndex / 12);
  if (lastYear !== years || lastIndex % 12 !== 0) {
    labels.push(years.toString());
    values.push(monthlyValues[lastIndex]);
  }
  
  return {labels, values};
};

