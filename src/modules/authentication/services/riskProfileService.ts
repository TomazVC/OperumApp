import {RiskQuestion, RiskProfileAnswers, RiskProfile} from '../../../shared/types';

// Definição das perguntas do questionário
export const riskQuestions: RiskQuestion[] = [
  {
    id: 'objective',
    question: 'Qual é o seu principal objetivo ao investir?',
    subtitle: 'Suas respostas nos ajudam a criar recomendações personalizadas',
    options: [
      { id: 'preserve', text: 'Preservar capital (segurança máxima)', value: 1 },
      { id: 'moderate', text: 'Crescimento moderado', value: 2 },
      { id: 'maximize', text: 'Maximizar retornos (aceito mais risco)', value: 3 }
    ]
  },
  {
    id: 'tolerance',
    question: 'Qual sua tolerância a perdas?',
    subtitle: 'Como você reagiria se seus investimentos perdessem valor?',
    options: [
      { id: 'no_loss', text: 'Não aceito perdas', value: 1 },
      { id: 'small_loss', text: 'Aceito perdas pequenas (até 10%)', value: 2 },
      { id: 'big_loss', text: 'Aceito perdas maiores (acima de 10%)', value: 3 }
    ]
  },
  {
    id: 'horizon',
    question: 'Qual seu horizonte de investimento?',
    subtitle: 'Por quanto tempo você pretende manter seus investimentos?',
    options: [
      { id: 'short', text: 'Curto prazo (até 1 ano)', value: 1 },
      { id: 'medium', text: 'Médio prazo (1-5 anos)', value: 2 },
      { id: 'long', text: 'Longo prazo (5+ anos)', value: 3 }
    ]
  },
  {
    id: 'experience',
    question: 'Qual sua experiência com investimentos?',
    subtitle: 'Como você se considera em relação aos investimentos?',
    options: [
      { id: 'beginner', text: 'Iniciante', value: 1 },
      { id: 'intermediate', text: 'Intermediário', value: 2 },
      { id: 'advanced', text: 'Avançado', value: 3 }
    ]
  },
  {
    id: 'volatility',
    question: 'Como você reage à volatilidade do mercado?',
    subtitle: 'O que você faria se o mercado caísse 20%?',
    options: [
      { id: 'sell', text: 'Vendo tudo imediatamente', value: 1 },
      { id: 'hold', text: 'Mantenho minha posição', value: 2 },
      { id: 'buy', text: 'Compro mais (é oportunidade)', value: 3 }
    ]
  }
];

// Função para calcular o perfil de risco baseado nas respostas
export const calculateRiskProfile = (answers: RiskProfileAnswers): RiskProfile => {
  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
  
  if (totalScore <= 5) {
    return 'Conservador';
  } else if (totalScore <= 10) {
    return 'Moderado';
  } else {
    return 'Agressivo';
  }
};

// Função para obter descrição do perfil
export const getRiskProfileDescription = (profile: RiskProfile): string => {
  switch (profile) {
    case 'Conservador':
      return 'Prefere segurança e estabilidade, com baixo risco de perdas';
    case 'Moderado':
      return 'Equilibra segurança e crescimento, aceita riscos moderados';
    case 'Agressivo':
      return 'Busca maximizar retornos, aceita riscos elevados';
    default:
      return '';
  }
};

// Função para obter objetivos baseados no perfil
export const getProfileObjectives = (profile: RiskProfile): string[] => {
  switch (profile) {
    case 'Conservador':
      return ['Preservação de capital', 'Renda fixa', 'Baixa volatilidade'];
    case 'Moderado':
      return ['Crescimento equilibrado', 'Diversificação', 'Renda fixa + variável'];
    case 'Agressivo':
      return ['Maximização de retornos', 'Ações e fundos', 'Alta volatilidade'];
    default:
      return [];
  }
};
