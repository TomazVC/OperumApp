# 📊 ENDPOINTS DE INFLAÇÃO - BRAPI API

**Data:** 03 de Novembro de 2025  
**Token:** `fQZNiALmLqMRjjeypszzpa` (Plano Básico)

---

## 🎯 RESUMO EXECUTIVO

### ✅ O QUE FUNCIONA (Plano Basic)

| Endpoint | Status | Descrição |
|----------|--------|-----------|
| `/v2/inflation/available` | ✅ **FUNCIONA** | Lista países com dados de inflação |
| `/v2/inflation/available?search=braz` | ✅ **FUNCIONA** | Busca países por nome |

### ❌ O QUE NÃO FUNCIONA (Requer Upgrade)

| Endpoint | Status | Erro | Mensagem |
|----------|--------|------|----------|
| `/v2/inflation?country=brazil` | ❌ **400** | Bad Request | "Você não tem acesso a este recurso, considere fazer um upgrade para um plano que suporte o acesso a moedas" |
| `/v2/inflation?country=brazil&start=01/01/2022&end=31/12/2022` | ❌ **400** | Bad Request | Mesma mensagem |
| `/v2/inflation?country=brazil&historical=true` | ❌ **400** | Bad Request | Mesma mensagem |

---

## 📋 DOCUMENTAÇÃO OFICIAL

### Endpoint 1: `/v2/inflation/available`

**Método:** GET  
**Autenticação:** Bearer Token (obrigatório)  
**Descrição:** Lista todos os países para os quais há dados de inflação disponíveis

#### Parâmetros (Query):
- `search` (string, opcional): Filtra países por nome (case-insensitive)
- `token` (string, alternativa): Token via query string (não recomendado, use header)

#### Exemplo de Requisição:
```bash
curl -H "Authorization: Bearer fQZNiALmLqMRjjeypszzpa" \
  "https://brapi.dev/api/v2/inflation/available"
```

#### Resposta de Sucesso (200):
```json
{
  "countries": ["brazil"]
}
```

#### Uso no TypeScript:
```typescript
import brapiService from './src/core/api/brapiService';

const countries = await brapiService.getAvailableInflationCountries();
// Retorna: ["brazil"]

const filtered = await brapiService.getAvailableInflationCountries('braz');
// Retorna: ["brazil"]
```

---

### Endpoint 2: `/v2/inflation`

**Método:** GET  
**Autenticação:** Bearer Token (obrigatório)  
**Descrição:** Retorna dados históricos de inflação para um país específico  
**⚠️  STATUS:** **NÃO DISPONÍVEL NO PLANO BASIC**

#### Parâmetros (Query):
- `country` (string, padrão: 'brazil'): Nome do país
- `historical` (boolean, padrão: false): Incluir dados históricos
- `start` (string, formato DD/MM/YYYY): Data inicial do período
- `end` (string, formato DD/MM/YYYY): Data final do período
- `sortBy` (string): Campo de ordenação ('date' ou 'value')
- `sortOrder` (string): Direção ('asc' ou 'desc')

#### Exemplo de Requisição:
```bash
curl -H "Authorization: Bearer fQZNiALmLqMRjjeypszzpa" \
  "https://brapi.dev/api/v2/inflation?country=brazil&start=01/01/2022&end=31/12/2022"
```

#### Resposta de Erro (400) - Plano Basic:
```json
{
  "error": true,
  "message": "Você não tem acesso a este recurso, considere fazer um upgrade para um plano que suporte o acesso a moedas em https://brapi.dev/pricing"
}
```

#### Resposta Esperada (200) - Plano Premium:
```json
{
  "inflation": [
    {
      "date": "31/12/2022",
      "value": "5.79",
      "epochDate": 1672444800
    },
    {
      "date": "30/11/2022",
      "value": "5.90",
      "epochDate": 1669852800
    }
  ]
}
```

#### Uso no TypeScript:
```typescript
import brapiService from './src/core/api/brapiService';

// ⚠️  Requer plano premium!
try {
  const inflation = await brapiService.getInflation('brazil', {
    start: '01/01/2022',
    end: '31/12/2022',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  console.log(inflation);
} catch (error) {
  console.error('Erro 400: Requer upgrade para plano premium');
}
```

---

## 🧪 RESULTADOS DOS TESTES

### Teste 1: Listar Países (✅ SUCESSO)
```
Endpoint: GET /v2/inflation/available
Status: 200 OK
Resposta: {"countries": ["brazil"]}
```

### Teste 2: Buscar "braz" (✅ SUCESSO)
```
Endpoint: GET /v2/inflation/available?search=braz
Status: 200 OK
Resposta: {"countries": ["brazil"]}
```

### Teste 3: Dados do Brasil (❌ ERRO 400)
```
Endpoint: GET /v2/inflation?country=brazil
Status: 400 Bad Request
Mensagem: "Você não tem acesso a este recurso, considere fazer um upgrade..."
```

### Teste 4: Dados de 2022 (❌ ERRO 400)
```
Endpoint: GET /v2/inflation?country=brazil&start=01/01/2022&end=31/12/2022
Status: 400 Bad Request
Mensagem: "Você não tem acesso a este recurso, considere fazer um upgrade..."
```

### Teste 5: Com Ordenação (❌ ERRO 400)
```
Endpoint: GET /v2/inflation?country=brazil&start=01/01/2022&end=31/12/2022&sortBy=value&sortOrder=asc
Status: 400 Bad Request
Mensagem: "Você não tem acesso a este recurso, considere fazer um upgrade..."
```

### Teste 6: Historical=true (❌ ERRO 400)
```
Endpoint: GET /v2/inflation?country=brazil&historical=true
Status: 400 Bad Request
Mensagem: "Você não tem acesso a este recurso, considere fazer um upgrade..."
```

---

## 💡 ALTERNATIVAS GRATUITAS

### API do IBGE (Instituto Brasileiro de Geografia e Estatística)

A API do IBGE fornece dados de inflação (IPCA) gratuitamente:

#### Endpoint IPCA:
```
https://servicodados.ibge.gov.br/api/v3/agregados/1737/periodos/YYYYMM/variaveis/63?localidades=N1[all]
```

#### Exemplo de Uso:
```typescript
// Buscar IPCA de janeiro de 2024
const response = await fetch(
  'https://servicodados.ibge.gov.br/api/v3/agregados/1737/periodos/202401/variaveis/63?localidades=N1[all]'
);
const data = await response.json();
```

#### Vantagens:
- ✅ Totalmente gratuito
- ✅ Dados oficiais do governo brasileiro
- ✅ Sem necessidade de autenticação
- ✅ Histórico completo desde 1980

#### Desvantagens:
- ❌ Apenas dados do Brasil
- ❌ API mais complexa
- ❌ Formato de resposta diferente

---

## 📊 COMPARAÇÃO DE PLANOS

| Recurso | Plano Basic | Plano Premium |
|---------|-------------|---------------|
| Lista de países | ✅ 1 país | ✅ Múltiplos países |
| Dados históricos | ❌ | ✅ |
| Filtragem por período | ❌ | ✅ |
| Ordenação | ❌ | ✅ |
| Rate limit | ~10 req/min | Maior |

---

## 🔧 IMPLEMENTAÇÃO NO BRAPISERVICE

### Funções Adicionadas:

#### 1. `getAvailableInflationCountries(search?: string)`
**Status:** ✅ Exportada e funcional  
**Descrição:** Lista países com dados de inflação  
**Plano:** Basic (funciona!)

```typescript
// Listar todos
const countries = await brapiService.getAvailableInflationCountries();

// Buscar específico
const br = await brapiService.getAvailableInflationCountries('braz');
```

#### 2. `getInflation(country, options)`
**Status:** ✅ Exportada mas retorna erro 400 no plano Basic  
**Descrição:** Busca dados históricos de inflação  
**Plano:** Premium (requer upgrade)

```typescript
// Requer upgrade!
const inflation = await brapiService.getInflation('brazil', {
  start: '01/01/2022',
  end: '31/12/2022',
  sortBy: 'date',
  sortOrder: 'desc'
});
```

---

## 📝 ATUALIZAÇÕES NOS ARQUIVOS

### `brapiService.ts`
- ✅ Adicionada função `getAvailableInflationCountries()`
- ✅ Atualizada documentação de `getInflation()` com aviso de erro 400
- ✅ Exportadas ambas as funções no `export default`
- ✅ Comentários indicando limitação do plano Basic

### `RESUMO_APIS.md`
- ✅ Adicionada seção "Inflação (IPCA e outros países)"
- ✅ Documentado erro 400 no plano Basic
- ✅ Sugerida alternativa: API do IBGE
- ✅ Atualizada tabela de comparação

### Arquivos de Teste:
- ✅ `test-inflation-endpoints.ts` - 6 testes completos
- ✅ `test-inflation-integration.ts` - Verificação de exportação

---

## ✅ CONCLUSÃO

### Para o OperumApp:

1. **Use `getAvailableInflationCountries()`** para mostrar ao usuário quais países estão disponíveis (atualmente só Brazil)

2. **NÃO use `getInflation()`** no plano Basic - retorna erro 400

3. **Alternativa recomendada:** Integrar API do IBGE para dados de IPCA gratuitos

4. **Upgrade necessário?** Só se precisar de dados de inflação de múltiplos países via Brapi

---

**Última atualização:** 03/11/2025 - Testes completos realizados ✅
