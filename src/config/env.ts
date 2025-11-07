// Configurações de ambiente para o app (NUNCA coloque segredos aqui)
// Em apps móveis, segredos não podem ficar no cliente. O acesso ao Gemini
// deve ser feito via proxy/servidor, definido por API_BASE_URL.

// Para Expo Web, tentamos ler de diferentes fontes
const getApiBaseUrl = () => {
  // 1. Tentar EXPO_PUBLIC_API_BASE_URL (padrão para Expo Web em produção)
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  // 2. Tentar API_BASE_URL (para compatibilidade ou outros ambientes)
  if (typeof process !== 'undefined' && process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }
  // 3. Fallback para localhost em desenvolvimento
  return 'http://localhost:8787';
};

// URL base do servidor que fará o proxy para a API da Google
export const API_BASE_URL = getApiBaseUrl();

// Modelo default utilizado no servidor
export const GEMINI_MODEL = 'gemini-2.5-flash';

// Configuração do Ollama (modelo local de IA) - mantido para referência
// export const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
// export const OLLAMA_MODEL = 'phi3:mini';

