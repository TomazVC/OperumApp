# Configuração do Ollama para Chatbot

## Introdução

O chatbot do Operum utiliza Ollama para gerar respostas com IA local. Isso proporciona:
- ✅ **Gratuito** - Sem custos de API
- ✅ **Privado** - Dados não saem da sua máquina
- ✅ **Offline** - Funciona sem internet

## Instalação

### 1. Baixar e instalar Ollama

Acesse: https://ollama.com/download

Windows: Baixe o instalador e execute.
Mac: `brew install ollama`
Linux: `curl -fsSL https://ollama.com/install.sh | sh`

### 2. Baixar modelo de IA

```bash
ollama pull phi3:mini
```

Modelos alternativos (menores, mas de menor qualidade):
```bash
ollama pull tinyllama      # 637 MB
ollama pull llama3.2:1b    # 1.3 GB
```

## Iniciar o Servidor

### Opção 1: Manual
```bash
ollama serve
```

### Opção 2: Automático (Windows)
O Ollama inicia automaticamente quando você abre o aplicativo.

## Configuração no App

As configurações estão em `src/config/env.ts`:

```typescript
export const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
export const OLLAMA_MODEL = 'phi3:mini';
```

Para alterar o modelo, edite `OLLAMA_MODEL`.

## Como Funciona

1. **Usuário envia mensagem** no chatbot
2. **App chama Ollama** na porta 11434
3. **Ollama processa** com IA local (pode levar 10-60s)
4. **Resposta exibida** no chat
5. **Se timeout (>90s)** → cai para resposta mock inteligente

## Troubleshooting

### Ollama não responde
**Erro**: `ECONNREFUSED`

**Solução**:
```bash
# Verificar se Ollama está rodando
ollama serve
```

### Timeout constante
**Erro**: `timeout of 90000ms exceeded`

**Causas**:
- Modelo muito pesado para seu hardware
- Computador lento (sem GPU)

**Soluções**:
1. Use modelo mais leve:
```bash
ollama pull tinyllama
```
2. Aumente RAM (recomendado 8GB+)
3. Instale GPU (NVIDIA/AMD) para aceleração

### Chat sempre usa mock
**Motivo**: Ollama muito lento (>90s) ou não está rodando

**Solução**: Verifique se `ollama serve` está rodando

## Modelos Recomendados

| Modelo | Tamanho | Velocidade | Qualidade | RAM Mínima |
|--------|---------|------------|-----------|------------|
| tinyllama | 637 MB | ⭐⭐⭐⭐⭐ | ⭐⭐ | 4 GB |
| phi3:mini | 2.2 GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 6 GB |
| llama3.2:3b | 2 GB | ⭐⭐⭐ | ⭐⭐⭐⭐ | 8 GB |
| mistral | 4.1 GB | ⭐⭐ | ⭐⭐⭐⭐⭐ | 12 GB |

## Requisitos

- **RAM**: 8 GB (recomendado 16 GB)
- **CPU**: Intel i5 ou AMD Ryzen 5+
- **Disco**: 5-10 GB livres
- **GPU**: Opcional (recomendado NVIDIA 6GB+)

## Verificação

Testar Ollama manualmente:

```bash
ollama list                                    # Ver modelos instalados
ollama run phi3:mini "Olá, tudo bem?"         # Testar modelo
```

## Resumo

✅ **Chatbot está funcional** - sempre retorna resposta
- Se Ollama disponível: resposta de IA real (pode demorar)
- Se Ollama lento/offline: resposta mock inteligente (rápido)

O app funciona em **ambas as situações** com fallback automático.

