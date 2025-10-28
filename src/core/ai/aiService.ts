import {OLLAMA_API_URL, OLLAMA_MODEL} from '../../config/env';
import {getChatHistory} from '../database/db';
import axios from 'axios';

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

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// System prompt para o assistente
const SYSTEM_PROMPT = `Você é o assistente virtual do aplicativo Operum - Assessor de Investimentos. 
Responda de forma clara, amigável, profissional e dentro das informações disponíveis no app. 
Se não souber responder, oriente o usuário a reformular ou procure outra forma de ajudar.
Para dados pessoais sensíveis (como saldo), informe que não pode acessar e oriente onde verificar no app.`;

/**
 * Constrói o array de mensagens para o chatbot
 */
export const buildMessagesArray = (userId: number, userMessage: string): Message[] => {
  // Recuperar histórico do usuário
  const history = getChatHistory(userId, 10);
  
  // Construir array de mensagens
  const messages: Message[] = [
    {role: 'system', content: SYSTEM_PROMPT}
  ];
  
  // Adicionar histórico recente
  history.forEach(msg => {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
  });
  
  // Adicionar mensagem atual do usuário
  messages.push({
    role: 'user',
    content: userMessage
  });
  
  return messages;
};

/**
 * Chama o Ollama para obter resposta do chatbot (IA local)
 * Faz fallback para mock se Ollama não estiver disponível
 */
export const callOllamaAPI = async (messages: Message[]): Promise<string> => {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userInput = lastUserMessage?.content || '';
  
  // System prompt bem simplificado para resposta rápida
  const systemPrompt = `Assistente de investimentos. Responda sobre CDB, Tesouro Direto, ações. 

Pergunta: ${userInput}
Resposta:`;
  
  try {
    console.log('Chamando Ollama...');
    
    const response = await axios.post(OLLAMA_API_URL, {
      model: OLLAMA_MODEL,
      prompt: systemPrompt,
      stream: false,
      options: {
        num_predict: 50, // Reduzir tokens para resposta mais rápida
        temperature: 0.7
      }
    }, {
      timeout: 90000 // Aumentar para 90 segundos (models locais são lentos)
    });
    
    console.log('Resposta do Ollama:', response.data);
    
    let assistantMessage = '';
    
    if (response.data?.response) {
      assistantMessage = response.data.response.trim();
    }
    
    if (assistantMessage) {
      console.log('✅ Ollama funcionou!');
      return assistantMessage;
    }
    
    throw new Error('Resposta vazia do Ollama');
    
  } catch (error: any) {
    console.error('Erro ao chamar Ollama:', error);
    console.log('Erro detalhado:', {
      code: error.code,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Tratamento específico de erros
    if (error.code === 'ECONNREFUSED') {
      console.log('Ollama não está rodando, usando fallback mock');
      return await getMockResponse(userInput.toLowerCase());
    }
    
    if (error.code === 'ECONNABORTED') {
      console.log('Timeout no Ollama (>60s), caiu para mock. Ollama pode estar processando...');
      return await getMockResponse(userInput.toLowerCase());
    }
    
    // Outros erros: usar mock
    console.log('Usando fallback mock devido a erro');
    return await getMockResponse(userInput.toLowerCase());
  }
};

/**
 * Mock inteligente baseado em palavras-chave
 */
const getMockResponse = async (userInput: string): Promise<string> => {
  // Simular delay de API
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 800));
  
  // Respostas contextuais
  if (userInput.includes('oi') || userInput.includes('olá') || userInput.includes('ola')) {
    return 'Olá! Como posso ajudá-lo com seus investimentos hoje?';
  }
  
  if (userInput.includes('saldo') || userInput.includes('quanto tenho')) {
    return 'Não consigo acessar dados pessoais, mas posso te guiar em como verificar no menu "Minha Conta".';
  }
  
  if (userInput.includes('investimento') || userInput.includes('investir')) {
    return 'Posso ajudar você a entender sobre investimentos. Para diversificar seu portfólio, recomendo considerar uma mistura de renda fixa e variável, alinhada ao seu perfil de risco.';
  }
  
  if (userInput.includes('cdb') || userInput.includes('tesouro')) {
    return 'CDB e Tesouro Direto são ótimas opções de renda fixa. CDB é emitido por bancos, enquanto Tesouro Selic é o investimento mais seguro do país, indexado à taxa Selic. Ambos são adequados para investidores conservadores.';
  }
  
  if (userInput.includes('ação') || userInput.includes('ações')) {
    return 'Investimentos em ações são parte da renda variável. Requerem análise cuidadosa do perfil de risco e objetivos financeiros. Recomendado para investidores com perfil mais agressivo e horizonte de investimento de longo prazo.';
  }
  
  if (userInput.includes('ajuda') || userInput.includes('help')) {
    return 'Posso ajudar com informações sobre investimentos, análise de portfólio, tipos de ativos (CDB, ações, tesouro direto), perfil de risco e estratégias de investimento. Qual sua dúvida específica?';
  }
  
  return 'Entendo sua dúvida sobre investimentos. Posso ajudá-lo com informações sobre diferentes tipos de ativos, análise de perfil de risco e estratégias de investimento. Como posso ajudar especificamente?';
};

/**
 * Função mock mantida para compatibilidade (não mais usada)
 */
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
