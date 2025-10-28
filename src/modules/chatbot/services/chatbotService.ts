import {callHuggingFaceAPI, buildMessagesArray} from '../../../core/ai/aiService';
import {insertChatMessage, ChatMessage as DBChatMessage} from '../../../core/database/db';
import {ChatMessage} from '../../../shared/types';

export const chatbotService = {
  async sendMessage(userId: number, message: string): Promise<ChatMessage> {
    try {
      // Salvar mensagem do usuário no banco
      insertChatMessage({
        userId,
        role: 'user',
        content: message
      });

      // Construir array de mensagens com histórico
      const messages = buildMessagesArray(userId, message);

      // Chamar API Hugging Face
      const assistantResponse = await callHuggingFaceAPI(messages);

      // Salvar resposta do assistente no banco
      insertChatMessage({
        userId,
        role: 'assistant',
        content: assistantResponse
      });

      // Retornar mensagem formatada para o UI
      return {
        id: Date.now().toString(),
        text: assistantResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
        userId,
        role: 'assistant'
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Mensagem de erro padrão
      const errorMessage = error instanceof Error ? error.message : 'Desculpe, estamos com instabilidade. Tente novamente mais tarde.';
      
      return {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date().toISOString(),
        userId,
        role: 'assistant'
      };
    }
  },

  async getAssetInfo(assetName: string, userProfile: string) {
    // Esta função pode ser removida ou mantida para compatibilidade
    // Por enquanto, mantemos a implementação antiga
    return {
      assetName,
      explanation: `${assetName} é um ativo de investimento que pode se adequar ao seu perfil.`,
      riskLevel: 'Médio' as const,
      recommendation: `Considere ${assetName} baseado no seu perfil ${userProfile}.`
    };
  },
};
