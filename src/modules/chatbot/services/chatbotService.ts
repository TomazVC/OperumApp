import {getChatbotResponse, getAssetExplanation} from '../../../core/ai/aiService';
import {ChatMessage} from '../../../shared/types';

export const chatbotService = {
  async sendMessage(message: string): Promise<ChatMessage> {
    try {
      const response = await getChatbotResponse(message);
      return {
        id: Date.now().toString(),
        text: response.message,
        isUser: false,
        timestamp: response.timestamp,
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  },

  async getAssetInfo(assetName: string, userProfile: string) {
    try {
      return await getAssetExplanation(assetName, userProfile);
    } catch (error) {
      console.error('Erro ao buscar informações do ativo:', error);
      throw error;
    }
  },
};
