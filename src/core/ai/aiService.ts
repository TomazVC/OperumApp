export interface ChatbotResponse {
  message: string;
  timestamp: string;
}

export interface AssetExplanation {
  assetName: string;
  explanation: string;
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  recommendation: string;
}

export const getChatbotResponse = async (_msg: string): Promise<ChatbotResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        'Entendo sua dúvida sobre investimentos. Posso ajudá-lo com informações sobre diferentes tipos de ativos.',
        'Para diversificar seu portfólio, recomendo considerar uma mistura de renda fixa e variável.',
        'A taxa Selic atual influencia diretamente os investimentos de renda fixa. Vou buscar os dados mais recentes.',
        'Investimentos em ações requerem análise cuidadosa do perfil de risco e objetivos financeiros.',
        'Considere sempre seu horizonte de investimento antes de tomar decisões importantes.',
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      resolve({
        message: randomResponse,
        timestamp: new Date().toISOString(),
      });
    }, 1500);
  });
};

export const getAssetExplanation = async (
  assetName: string,
  _userProfile: string
): Promise<AssetExplanation> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const explanations: Record<string, AssetExplanation> = {
        'CDB': {
          assetName: 'CDB',
          explanation: 'Certificado de Depósito Bancário é um título de renda fixa emitido por bancos.',
          riskLevel: 'Baixo',
          recommendation: 'Adequado para investidores conservadores que buscam segurança.',
        },
        'Ações': {
          assetName: 'Ações',
          explanation: 'Representam participação no capital social de uma empresa.',
          riskLevel: 'Alto',
          recommendation: 'Recomendado para investidores com perfil mais agressivo.',
        },
        'Tesouro Selic': {
          assetName: 'Tesouro Selic',
          explanation: 'Título público indexado à taxa Selic, considerado o investimento mais seguro do país.',
          riskLevel: 'Baixo',
          recommendation: 'Ideal para reserva de emergência e investidores conservadores.',
        },
      };
      
      const explanation = explanations[assetName] || {
        assetName,
        explanation: 'Ativo não reconhecido. Consulte um especialista para mais informações.',
        riskLevel: 'Médio' as const,
        recommendation: 'Recomendo análise detalhada antes do investimento.',
      };
      
      resolve(explanation);
    }, 2000);
  });
};
