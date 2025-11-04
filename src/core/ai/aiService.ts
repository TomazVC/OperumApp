import {GEMINI_API_KEY, GEMINI_MODEL} from '../../config/env';
// import {OLLAMA_API_URL, OLLAMA_MODEL} from '../../config/env'; // Mantido para referência
import {getChatHistory} from '../database/db';
import {GoogleGenerativeAI} from '@google/generative-ai';
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

// Templates específicos para produtos financeiros
const PRODUCT_TEMPLATES: Record<string, string> = {
  'CDB': `CDB é um Certificado de Depósito Bancário emitido por bancos, geralmente atrelado ao CDI.

Características:
- Risco: crédito do banco, coberto pelo FGC até R$ 250.000
- Liquidez: pode ser diária ou no vencimento
- Tributação: IR regressivo sobre os rendimentos

Dica: para reserva de emergência, prefira CDB com liquidez diária.`,

  'LCI': `LCI é uma Letra de Crédito Imobiliário que financia o setor imobiliário.

Características:
- Isenta de IR para pessoa física
- Cobertura FGC até R$ 250.000
- Pode ter liquidez apenas no vencimento

Comparação: LCI tende a pagar menos que CDB, mas é livre de IR.`,

  'LCA': `LCA é uma Letra de Crédito do Agronegócio que financia o setor agrícola.

Características:
- Isenta de IR para pessoa física
- Cobertura FGC até R$ 250.000
- Liquidez conforme prazo do título

Vantagem: diversifica exposição ao agronegócio brasileiro.`,

  'TESOURO SELIC': `Tesouro Selic é um título público indexado à taxa Selic.

Características:
- Mais seguro do país (risco soberano)
- Liquidez diária
- Tributação: IR regressivo

Ideal para: reserva de emergência e investidores conservadores.`,

  'TESOURO IPCA': `Tesouro IPCA+ oferece proteção contra inflação mais taxa fixa.

Características:
- Risco: marcação a mercado
- Tributação: IR regressivo
- Pode ter volatilidade no curto prazo

Cuidado: pode oscilar antes do vencimento.`,

  'AÇÕES': `Ações representam participação no capital de empresas.

Características:
- Risco: volatilidade, liquidez, fatores macro
- Potencial: crescimento e dividendos
- Tributação: isenção até R$ 20.000/mês em vendas

Recomendado para: perfil moderado/agressivo, longo prazo.`,

  'FII': `FIIs são Fundos Imobiliários que investem em imóveis.

Características:
- Renda mensal via dividendos
- Isenção IR sobre rendimentos mensais
- Tributação: IR sobre ganho de capital

Diversifique: logístico, CRI, lajes corporativas.`,

  'ETF': `ETFs são Fundos de Índice que investem em índices de mercado.

Características:
- Diversificação automática
- Taxa baixa de administração
- Tributação: come-cotas (fundos)

Vantagem: exposição ampla com baixo custo.`,

  'CRIPTO': `Criptomoedas são investimentos de alto risco.

Características:
- Risco muito alto, volatilidade extrema
- Sem garantia do FGC
- Custódia e segurança são essenciais

Recomendação: apenas o que pode oscilar muito (posição satélite).`,

  'RESERVA': `Reserva de Emergência deve ter alta liquidez e baixo risco.

Características:
- Prazo: curto | Liquidez: alta | Risco: baixo
- Opções: Tesouro Selic, CDB liquidez diária
- Objetivo: 3-6 meses de gastos

Evite: produtos com marcação a mercado.`
};

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// System prompt otimizado para o assistente Operum
const SYSTEM_PROMPT = `Você é o assistente virtual do Operum, especializado EXCLUSIVAMENTE em investimentos brasileiros.

REGRAS OBRIGATÓRIAS:
- Responda APENAS sobre investimentos, finanças e produtos financeiros brasileiros
- Se a pergunta NÃO for sobre investimentos/finanças, responda: "Posso ajudar apenas com investimentos brasileiros. Qual sua dúvida sobre CDB, Tesouro, ações, FIIs ou ETFs?"
- SEMPRE complete sua resposta, mesmo que precise resumir
- Para dados pessoais: "Acesse Menu > Carteira no app"
- Use linguagem natural e direta
- IMPORTANTE: termine sempre com uma frase completa, nunca corte no meio

PRODUTOS QUE CONHEÇO (APENAS ESTES):
- Renda Fixa: CDB, LCI, LCA, Tesouro Selic, Tesouro IPCA+
- Renda Variável: Ações, FIIs, ETFs
- Reserva de Emergência: Tesouro Selic, CDB liquidez diária
- Conceitos: risco, liquidez, tributação, diversificação

PROIBIDO:
- Receitas de comida, culinária, gastronomia
- Produtos americanos (Roth IRA, Traditional IRA)
- Assuntos não financeiros (esportes, política, entretenimento)
- Qualquer tema fora de investimentos brasileiros`;

/**
 * Verifica se a pergunta está fora do contexto financeiro
 */
const isOutOfFinanceContext = (userInput: string): boolean => {
  const input = userInput.toLowerCase();
  
  // Palavras-chave que indicam assuntos não financeiros
  const nonFinanceKeywords = [
    'receita', 'bolo', 'comida', 'culinária', 'gastronomia', 'cozinha',
    'esporte', 'futebol', 'política', 'eleição', 'entretenimento',
    'filme', 'música', 'viagem', 'turismo', 'saúde', 'medicina',
    'educação', 'escola', 'universidade', 'trabalho', 'emprego',
    'relacionamento', 'amor', 'família', 'casa', 'decoração',
    'moda', 'roupa', 'beleza', 'exercício', 'academia'
  ];
  
  // Se contém palavras não financeiras, está fora do contexto
  return nonFinanceKeywords.some(keyword => input.includes(keyword));
};

/**
 * Verifica se a resposta está completa e adiciona conclusão se necessário
 */
const ensureCompleteResponse = (response: string): string => {
  const trimmedResponse = response.trim();
  
  // Se a resposta termina com pontuação adequada, está completa
  if (trimmedResponse.endsWith('.') || trimmedResponse.endsWith('!') || trimmedResponse.endsWith('?')) {
    return trimmedResponse;
  }
  
  // Se termina com vírgula ou dois pontos, adiciona conclusão
  if (trimmedResponse.endsWith(',') || trimmedResponse.endsWith(':')) {
    return trimmedResponse + ' Espero ter ajudado!';
  }
  
  // Se não termina com pontuação, adiciona conclusão
  return trimmedResponse + '. Espero ter ajudado!';
};

/**
 * Detecta produtos financeiros na pergunta e retorna template específico
 */
const getProductTemplate = (userInput: string): string | null => {
  const input = userInput.toUpperCase();
  
  // Mapeamento de palavras-chave para produtos
  const productKeywords: Record<string, string> = {
    'CDB': 'CDB',
    'CERTIFICADO DE DEPÓSITO': 'CDB',
    'LCI': 'LCI', 
    'LETRA DE CRÉDITO IMOBILIÁRIO': 'LCI',
    'LCA': 'LCA',
    'LETRA DE CRÉDITO AGRONEGÓCIO': 'LCA',
    'TESOURO SELIC': 'TESOURO SELIC',
    'SELIC': 'TESOURO SELIC',
    'TESOURO IPCA': 'TESOURO IPCA',
    'IPCA': 'TESOURO IPCA',
    'AÇÃO': 'AÇÕES',
    'AÇÕES': 'AÇÕES',
    'FII': 'FII',
    'FUNDO IMOBILIÁRIO': 'FII',
    'ETF': 'ETF',
    'FUNDO DE ÍNDICE': 'ETF',
    'BITCOIN': 'CRIPTO',
    'CRIPTO': 'CRIPTO',
    'CRIPTOMOEDA': 'CRIPTO',
    'RESERVA': 'RESERVA',
    'EMERGÊNCIA': 'RESERVA'
  };
  
  // Busca por palavras-chave
  for (const [keyword, product] of Object.entries(productKeywords)) {
    if (input.includes(keyword)) {
      return PRODUCT_TEMPLATES[product];
    }
  }
  
  return null;
};

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
 * Chama o Google Gemini API para obter resposta do chatbot
 * Faz fallback para mock se a API não estiver disponível
 */
export const callGeminiAPI = async (messages: Message[]): Promise<string> => {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userInput = lastUserMessage?.content || '';
  
  // Verificar se a pergunta está fora do contexto financeiro
  if (isOutOfFinanceContext(userInput)) {
    return 'Posso ajudar apenas com investimentos brasileiros. Qual sua dúvida sobre CDB, Tesouro, ações, FIIs ou ETFs?';
  }
  
  // Verificar se há template específico para o produto
  const productTemplate = getProductTemplate(userInput);
  
  // Construir system instruction com ou sem template específico
  const systemInstruction = productTemplate 
    ? `${SYSTEM_PROMPT}\n\n${productTemplate}`
    : SYSTEM_PROMPT;
  
  try {
    console.log('Chamando Google Gemini API...');
    
    // Inicializar cliente Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      systemInstruction: systemInstruction
    });
    
    // Converter mensagens para formato Gemini (remover system messages, já está no systemInstruction)
    // A Gemini API espera um histórico de mensagens alternando entre user e model
    // IMPORTANTE: O histórico deve SEMPRE começar com 'user', não 'model'
    const filteredMessages = messages.filter(msg => msg.role !== 'system');
    
    // Remover a última mensagem (que é a mensagem atual do usuário que será enviada separadamente)
    const historyMessages = filteredMessages.slice(0, -1);
    
    // Converter para formato Gemini e garantir que comece com 'user'
    // Se o histórico começar com 'model', remover até encontrar a primeira mensagem 'user'
    const chatHistory: Array<{role: 'user' | 'model'; parts: Array<{text: string}>}> = [];
    
    // Encontrar o primeiro índice com role 'user'
    let firstUserIndex = -1;
    for (let i = 0; i < historyMessages.length; i++) {
      if (historyMessages[i].role === 'user') {
        firstUserIndex = i;
        break;
      }
    }
    
    // Se encontrou um 'user', começar a partir dele; se não, não usar histórico
    if (firstUserIndex >= 0) {
      // Converter todas as mensagens a partir do primeiro 'user'
      for (let i = firstUserIndex; i < historyMessages.length; i++) {
        const msg = historyMessages[i];
        const role = msg.role === 'user' ? 'user' : 'model';
        chatHistory.push({
          role,
          parts: [{ text: msg.content }]
        });
      }
    }
    
    // Criar histórico de chat ou usar mensagem única
    let response;
    if (chatHistory.length > 0 && chatHistory[0].role === 'user') {
      // Verificar se o histórico termina em 'user' (deve terminar em 'model' para ser válido)
      // Se terminar em 'user', remover a última mensagem pois será enviada separadamente
      const lastRole = chatHistory[chatHistory.length - 1].role;
      const validHistory = lastRole === 'user' 
        ? chatHistory.slice(0, -1) 
        : chatHistory;
      
      if (validHistory.length > 0 && validHistory[0].role === 'user') {
        // Se há histórico válido começando com 'user', usar startChat
        const chat = model.startChat({
          history: validHistory
        });
        response = await chat.sendMessage(userInput);
      } else {
        // Se não há histórico válido, usar generateContent diretamente
        response = await model.generateContent(userInput);
      }
    } else {
      // Se não há histórico válido, usar generateContent diretamente
      response = await model.generateContent(userInput);
    }
    
    console.log('Resposta do Gemini:', response);
    
    // Extrair texto da resposta
    const responseText = response.response.text();
    
    if (responseText) {
      console.log('✅ Gemini funcionou!');
      return ensureCompleteResponse(responseText);
    }
    
    throw new Error('Resposta vazia do Gemini');
    
  } catch (error: any) {
    console.error('Erro ao chamar Gemini:', error);
    console.log('Erro detalhado:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Tratamento de erros com fallback para mock
    if (error.message?.includes('API key') || error.message?.includes('401')) {
      console.log('Erro de autenticação Gemini, usando fallback mock');
      return await getMockResponse(userInput.toLowerCase());
    }
    
    if (error.message?.includes('timeout') || error.message?.includes('network')) {
      console.log('Timeout ou erro de rede no Gemini, usando fallback mock');
      return await getMockResponse(userInput.toLowerCase());
    }
    
    // Outros erros: usar mock
    console.log('Usando fallback mock devido a erro no Gemini');
    return await getMockResponse(userInput.toLowerCase());
  }
};

/**
 * Chama o Ollama para obter resposta do chatbot (IA local)
 * Faz fallback para mock se Ollama não estiver disponível
 * MANTIDO PARA REFERÊNCIA - Não mais usado
 */
/* 
export const callOllamaAPI = async (messages: Message[]): Promise<string> => {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userInput = lastUserMessage?.content || '';
  
  // Verificar se a pergunta está fora do contexto financeiro
  if (isOutOfFinanceContext(userInput)) {
    return 'Posso ajudar apenas com investimentos brasileiros. Qual sua dúvida sobre CDB, Tesouro, ações, FIIs ou ETFs?';
  }
  
  // Verificar se há template específico para o produto
  const productTemplate = getProductTemplate(userInput);
  
  // System prompt otimizado com template específico se disponível
  const systemPrompt = productTemplate 
    ? `${productTemplate}\n\nPergunta: ${userInput}\nResposta completa (termine sempre com frase completa):`
    : `Você é o assistente do Operum, especializado EXCLUSIVAMENTE em investimentos brasileiros.

REGRAS OBRIGATÓRIAS:
- Responda APENAS sobre investimentos, finanças e produtos financeiros brasileiros
- Se a pergunta NÃO for sobre investimentos/finanças, responda: "Posso ajudar apenas com investimentos brasileiros. Qual sua dúvida sobre CDB, Tesouro, ações, FIIs ou ETFs?"
- SEMPRE complete sua resposta com uma frase final. Nunca corte no meio

Pergunta: ${userInput}
Resposta completa:`;
  
  try {
    console.log('Chamando Ollama...');
    
    const response = await axios.post(OLLAMA_API_URL, {
      model: OLLAMA_MODEL,
      prompt: systemPrompt,
      stream: false,
      options: {
        num_predict: 500, // Tokens suficientes para resposta completa
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
      return ensureCompleteResponse(assistantMessage);
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
*/

/**
 * Mock inteligente baseado em templates específicos
 */
const getMockResponse = async (userInput: string): Promise<string> => {
  // Simular delay de API
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 800));
  
  const input = userInput.toLowerCase();
  
  // Verificar se a pergunta está fora do contexto financeiro
  if (isOutOfFinanceContext(userInput)) {
    return 'Posso ajudar apenas com investimentos brasileiros. Qual sua dúvida sobre CDB, Tesouro, ações, FIIs ou ETFs?';
  }
  
  // Verificar se há template específico para o produto
  const productTemplate = getProductTemplate(userInput);
  if (productTemplate) {
    return ensureCompleteResponse(productTemplate);
  }
  
  // Respostas contextuais melhoradas
  if (input.includes('oi') || input.includes('olá') || input.includes('ola')) {
    return ensureCompleteResponse(`Olá! Sou o assistente do Operum e posso te ajudar com investimentos brasileiros.

Posso explicar sobre:
- CDB, LCI, LCA e Tesouro Direto
- Ações, FIIs e ETFs
- Como montar uma reserva de emergência
- Diversificação de carteira

Qual sua dúvida sobre investimentos?`);
  }
  
  if (input.includes('saldo') || input.includes('quanto tenho') || input.includes('carteira')) {
    return ensureCompleteResponse(`Para ver seus dados pessoais, acesse:
- Saldo/Carteira: Menu > Carteira no app
- Extrato: Menu > Extrato no app
- Aplicações: Investir > Escolher produto

Não consigo acessar seus dados por segurança.`);
  }
  
  if (input.includes('investimento') || input.includes('investir') || input.includes('começar')) {
    return ensureCompleteResponse(`Para começar a investir, considere:

1. Reserva de emergência primeiro (Tesouro Selic ou CDB liquidez diária)
2. Diversifique entre renda fixa e variável
3. Defina seu perfil de risco (conservador, moderado ou agressivo)
4. Pense no prazo (curto, médio ou longo)

Qual seu objetivo e prazo para investir?`);
  }
  
  if (input.includes('ajuda') || input.includes('help')) {
    return ensureCompleteResponse(`Posso ajudar com:

Produtos brasileiros:
- CDB, LCI, LCA, Tesouro Selic, Tesouro IPCA+
- Ações, FIIs, ETFs

Conceitos:
- Risco, liquidez, tributação
- Diversificação, reserva de emergência
- Impostos (IR, come-cotas, isenções)

Qual sua dúvida específica?`);
  }
  
  if (input.includes('risco') || input.includes('seguro')) {
    return ensureCompleteResponse(`Gestão de risco nos investimentos:

Baixo risco: Tesouro Selic, CDB, LCI/LCA
Médio risco: FIIs, ETFs, ações de empresas grandes
Alto risco: ações pequenas, criptomoedas

A diversificação reduz o risco total da carteira. Qual seu perfil de risco?`);
  }
  
  return ensureCompleteResponse(`Posso ajudar com investimentos brasileiros como CDB, Tesouro, ações, FIIs e ETFs.

Para te orientar melhor, me conte:
- Qual seu objetivo?
- Que prazo você tem?
- Qual valor pretende investir?

Assim posso dar uma resposta mais específica!`);
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
