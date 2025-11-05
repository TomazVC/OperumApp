// Configurações de ambiente para o app (NUNCA coloque segredos aqui)
// Em apps móveis, segredos não podem ficar no cliente. O acesso ao Gemini
// deve ser feito via proxy/servidor, definido por API_BASE_URL.

// URL base do servidor que fará o proxy para a API da Google
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8787';

// Modelo default utilizado no servidor
export const GEMINI_MODEL = 'gemini-2.5-flash';

// Configuração do Ollama (modelo local de IA) - mantido para referência
// export const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
// export const OLLAMA_MODEL = 'phi3:mini';

