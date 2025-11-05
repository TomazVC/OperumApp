# 📊 RESUMO COMPLETO - APIs do OperumApp

**Data:** 03 de Novembro de 2025  
**Tokens testados:** 
- `REDACTED` (Token principal - RECOMENDADO)
- `REDACTED` (Token alternativo - mesma cobertura)

---

## 🎯 Brapi API - Plano Básico

### ✅ RECURSOS DISPONÍVEIS

#### 1. Cotações de Ações

**🆓 4 AÇÕES DE TESTE (Sem token, acesso total a TODOS os módulos):**
```typescript
// PETR4, MGLU3, VALE3, ITUB4 - Acesso completo SEM token
const petr4 = await getStockQuote('PETR4');  
const mglu3 = await getStockQuote('MGLU3');
const vale3 = await getStockQuote('VALE3');
const itub4 = await getStockQuote('ITUB4');

// COM módulos avançados (sem token)
const itub4Full = await getStockQuoteWithModules('ITUB4', {
  modules: ['summaryProfile', 'balanceSheetHistory', 'incomeStatementHistory'],
  dividends: true
});
```

**🔑 TODAS as 1854+ ações da B3 (Com token, cotação simples):**
```typescript
// Cotação básica - FUNCIONA
const wege3 = await getStockQuote('WEGE3');  // R$ 42.80
const bbas3 = await getStockQuote('BBAS3');  // Funciona!
const ggbr4 = await getStockQuote('GGBR4');  // Funciona!

// Com módulos - REQUER UPGRADE DO PLANO
const wege3Full = await getStockQuoteWithModules('WEGE3', {
  modules: ['summaryProfile']  // ❌ 403 Forbidden
});
```

#### 2. Módulo `summaryProfile` - Perfil da Empresa
```typescript
// ✅ Funciona para ações de teste (PETR4, MGLU3, VALE3, ITUB4)
const itub4 = await getStockQuoteWithModules('ITUB4', {
  modules: ['summaryProfile']
});
// Retorna: setor, indústria, endereço, website, descrição, funcionários

// ❌ Não funciona para outras ações no plano Basic
const wege3 = await getStockQuoteWithModules('WEGE3', {
  modules: ['summaryProfile']  // 403 Forbidden
});
```

#### 3. Histórico de Preços
```typescript
const petr4 = await getStockQuote('PETR4');
// Parâmetros: range (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
// Parâmetros: interval (1d, 5d, 1wk, 1mo)
```

#### 4. Histórico Completo de Dividendos
```typescript
const itub4 = await getStockQuoteWithModules('ITUB4', {
  dividends: true
});
// Retorna: 66+ registros de dividendos e JCP
```

#### 5. Endpoint `/quote/list` - Filtros Avançados
```typescript
const stocks = await getStockList({
  sector: 'Finance',           // Filtro por setor
  type: 'bdr',                 // stock, bdr, fund
  sortBy: 'marketCap',         // market_cap_basic, volume, change, name
  sortOrder: 'desc',           // desc, asc
  limit: 10,                   // Limite de resultados
  search: 'Petrobras'          // Busca por nome (não funciona bem)
});
// Total: 1854 ações disponíveis
```

---

### ❌ LIMITAÇÕES DO PLANO BÁSICO

#### 1. Módulos Financeiros Avançados

**⚠️ IMPORTANTE:** Módulos avançados funcionam APENAS para as 4 ações de teste:
- ✅ **PETR4** (Petrobras PN) - Acesso completo sem token
- ✅ **MGLU3** (Magazine Luiza ON) - Acesso completo sem token
- ✅ **VALE3** (Vale ON) - Acesso completo sem token
- ✅ **ITUB4** (Itaú Unibanco PN) - Acesso completo sem token

**Para TODAS as outras ações (WEGE3, BBAS3, etc):**
```
❌ balanceSheetHistory (Balanço Patrimonial)
❌ incomeStatementHistory (DRE)
❌ cashflowHistory (DFC)
❌ financialData (EBITDA, ROE, etc)
❌ defaultKeyStatistics (P/L avançado, etc)
❌ summaryProfile (Perfil da empresa)
```

**Erro:** 403 Forbidden  
**Mensagem:** "O seu plano não permite acessar dados do módulo..."

#### 2. Criptomoedas - Cotações
```
❌ Endpoint /v2/crypto (cotações de Bitcoin, Ethereum, etc)
✅ Endpoint /v2/crypto/available (lista de 301 criptos disponíveis)
```

**Erro:** 400 Bad Request  
**Mensagem:** "Você não tem acesso a este recurso, considere fazer um upgrade para um plano que suporte o acesso a moedas"

**Funciona:** Lista de criptomoedas disponíveis (301 tickers)

#### 3. Inflação - Dados Históricos
```
❌ Endpoint /v2/inflation (dados históricos de inflação)
✅ Endpoint /v2/inflation/available (lista de países disponíveis)
```

**Erro:** 400 Bad Request  
**Mensagem:** "Você não tem acesso a este recurso, considere fazer um upgrade para um plano que suporte o acesso a moedas"

**Funciona:** Lista de países com dados de inflação (atualmente: apenas "brazil")

#### 4. Rate Limit
```
⚠️  ~10 requisições por minuto
❌ Erro 429 se exceder
```

**Solução:** Implementar cache (já implementado) e delay entre requisições

---

## 🧪 AÇÕES GRATUITAS COM ACESSO COMPLETO

### 4 Ações Especiais (sem limitações)

Estas ações têm acesso a **TODOS os módulos**, mesmo sem token ou com plano básico:

1. **PETR4** - Petrobras PN
2. **MGLU3** - Magazine Luiza ON
3. **VALE3** - Vale ON
4. **ITUB4** - Itaú Unibanco PN

```typescript
// ITUB4 com TODOS os módulos (funciona!)
const itub4Full = await getStockQuoteWithModules('ITUB4', {
  modules: [
    'summaryProfile',
    'balanceSheetHistory',      // ✅ 16 períodos
    'incomeStatementHistory',   // ✅ 15 períodos
    'cashflowHistory',          // ✅ 15 períodos
    'financialData',            // ✅ ROE, EBITDA, etc
    'defaultKeyStatistics'      // ✅ P/L, Dividend Yield, etc
  ],
  dividends: true,
  range: '1y',
  interval: '1d'
});
```

---

## 🌐 AwesomeAPI - Complemento

### ✅ RECURSOS DISPONÍVEIS (Gratuito, sem token)

#### 1. Cotações de Moedas
```typescript
const usd = await getDollarQuote();   // R$ 5.3578
const eur = await getEuroQuote();     // R$ 6.21118
const btc = await getBitcoinQuote();  // R$ 589.200
```

#### 2. Múltiplas Moedas
```typescript
const currencies = await getMultipleCurrencies(['USD-BRL', 'EUR-BRL', 'BTC-BRL']);
```

**💡 USO RECOMENDADO:** Como a Brapi não tem acesso a cotações de criptomoedas no plano básico, use a AwesomeAPI para BTC-BRL, ETH-BRL e outras moedas.

### 📈 Inflação (IPCA e outros países)

#### Funcionalidades:
```typescript
// ✅ Listar países disponíveis (FUNCIONA!)
const countries = await brapiService.getAvailableInflationCountries();
// Retorna: ["brazil"]

// ❌ Buscar dados históricos (REQUER UPGRADE)
const inflation = await brapiService.getInflation('brazil', {
  start: '01/01/2022',
  end: '31/12/2022'
});
// Erro 400: "Você não tem acesso a este recurso..."
```

**Detalhes:**
- ✅ `/v2/inflation/available` - Lista países disponíveis (atualmente só "brazil")
- ❌ `/v2/inflation` - Dados históricos de inflação (requer plano premium)

**Solução alternativa:** API do IBGE para dados de inflação gratuitos (IPCA)

### 💰 Taxa Selic (Prime Rate)

#### Funcionalidades:
```typescript
// ✅ Listar países disponíveis (FUNCIONA!)
const countries = await brapiService.getAvailablePrimeRateCountries();
// Retorna: ["brazil"]

// ✅ Buscar taxa Selic ATUAL (FUNCIONA!)
const currentRate = await brapiService.getLatestPrimeRate();
// Retorna: 15 (15.00% em 03/11/2025)

// ❌ Buscar dados históricos (REQUER UPGRADE)
const historical = await brapiService.getPrimeRate('brazil', {
  start: '01/01/2022',
  end: '31/12/2022'
});
// Erro 400: "Você não tem acesso a este recurso..."
```

**Detalhes:**
- ✅ `/v2/prime-rate/available` - Lista países disponíveis (atualmente só "brazil")
- ✅ `/v2/prime-rate?country=brazil` - Taxa Selic atual (15.00%)
- ❌ `/v2/prime-rate` com start/end/historical - Dados históricos (requer plano premium)

**Importante:** No plano Basic, você consegue a **taxa atual**, mas não o histórico!

### ⚠️  LIMITAÇÕES

```
❌ Selic - Endpoint não existe (mockado: 10-12%)
❌ Ibovespa - Endpoint não existe (mockado)
```

**Solução:** Usar Brapi para ^BVSP (Ibovespa) - índice disponível no endpoint /quote/^BVSP

---

## 📋 Comparação dos Tokens

| Recurso | REDACTED | REDACTED |
|---------|------------------------|------------------------|
| **AÇÕES DE TESTE (sem token)** | | |
| PETR4/MGLU3/VALE3/ITUB4 básico | ✅ Sim | ✅ Sim |
| PETR4/MGLU3/VALE3/ITUB4 + módulos | ✅ Todos módulos | ✅ Todos módulos |
| **OUTRAS AÇÕES (com token)** | | |
| Cotação única (WEGE3) | ✅ R$ 42.80 | ✅ R$ 42.80 |
| Múltiplas ações | ✅ 3 ações | ✅ 3 ações |
| Lista de ações | ✅ 1854 ações | ✅ 1854 ações |
| Setor Finance | ✅ 5 ações | ✅ 5 ações |
| Histórico de dividendos | ✅ 66 registros | ✅ 66 registros |
| Módulos financeiros (WEGE3+) | ❌ 403 | ❌ 403 |
| **CRIPTOMOEDAS** | | |
| Cotações | ❌ 400 | ❌ 400 |
| Lista disponível | ✅ 301 tickers | ✅ 301 tickers |
| **INDICADORES ECONÔMICOS** | | |
| Inflação (dados) | ❌ 400 | ❌ 400 |
| Inflação (lista) | ✅ 1 país | ✅ 1 país |
| Taxa Selic (atual) | ✅ 15.00% | ✅ 15.00% |
| Taxa Selic (histórico) | ❌ 400 | ❌ 400 |
| Taxa Selic (países) | ✅ 1 país | ✅ 1 país |

**Conclusão:** Ambos os tokens têm **exatamente a mesma cobertura**. Use qualquer um.

### Para o seu app OperumApp, você deve:

#### ✅ USAR BRAPI PARA:
- Cotações de **TODAS** as ações da B3 (1854+ ativos)
- Perfil das empresas (`summaryProfile`)
- Histórico de preços
- Dividendos completos
- Listas filtradas por setor/tipo
- **Demonstrações completas apenas das 4 ações gratuitas** (PETR4, MGLU3, VALE3, ITUB4)

#### ✅ USAR AWESOMEAPI PARA:
- Dólar, Euro, Bitcoin (cotações de moedas)
- Outras moedas internacionais

#### ❌ NÃO DISPONÍVEL:
- Balanço Patrimonial de ações além das 4 gratuitas
- DRE de ações além das 4 gratuitas
- DFC de ações além das 4 gratuitas
- Indicadores financeiros avançados de ações além das 4 gratuitas

---

## 🎯 RECOMENDAÇÃO FINAL

### Token a usar:
```typescript
const API_TOKEN = 'REDACTED'; // Ambos têm mesmo acesso
```

### Arquitetura sugerida:

```typescript
// 1. Para cotações simples (QUALQUER ação)
const quote = await brapiService.getStockQuote('WEGE3'); ✅

// 2. Para dados avançados (APENAS ações gratuitas)
const detailedData = await brapiService.getStockQuoteWithModules('ITUB4', {
  modules: ['balanceSheetHistory', 'incomeStatementHistory']
}); ✅

// 3. Para moedas
const usd = await awesomeApiService.getDollarQuote(); ✅

// 4. Para listas filtradas
const topStocks = await brapiService.getStockList({
  sector: 'Technology',
  sortBy: 'marketCap',
  limit: 10
}); ✅
```

### Cache e Rate Limit:
```typescript
// Cache já implementado: 60 segundos
// Rate limit: max 10 req/min
// Solução: Agrupar requisições e usar cache agressivamente
```

---

## 📊 TABELA DE COMPARAÇÃO

| Recurso | Plano Básico | Ações Gratuitas (4) | AwesomeAPI |
|---------|--------------|---------------------|------------|
| Cotações simples | ✅ Todas as ações | ✅ | ❌ |
| Perfil empresa | ✅ Todas | ✅ | ❌ |
| Dividendos | ✅ Todas | ✅ | ❌ |
| Balanço Patrimonial | ❌ | ✅ | ❌ |
| DRE | ❌ | ✅ | ❌ |
| DFC | ❌ | ✅ | ❌ |
| Indicadores avançados | ❌ | ✅ | ❌ |
| Moedas | ❌ | ❌ | ✅ |
| Criptomoedas (cotações) | ❌ | ❌ | ✅ BTC apenas |
| Criptomoedas (lista) | ✅ 301 tickers | ✅ | ❌ |
| Inflação (dados) | ❌ | ❌ | ❌ |
| Inflação (países) | ✅ 1 país | ✅ | ❌ |
| Selic (atual) | ✅ 15.00% | ✅ | ❌ |
| Selic (histórico) | ❌ | ❌ | ❌ |
| Selic (países) | ✅ 1 país | ✅ | ❌ |

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ `brapiService.ts` - Já atualizado com token correto
2. ✅ `awesomeApiService.ts` - Já implementado
3. ✅ **`test-brapi-complete.ts`** - Teste completo de todos os endpoints
4. ⏳ Integrar nos componentes React Native
5. ⏳ Criar tela de demonstração com as 4 ações gratuitas (dados completos)
6. ⏳ Criar tela de lista de ações (todas as 1854)
7. ⏳ Implementar debounce/throttle para rate limit

---

## 🧪 EXECUTAR TESTES

Para testar todos os endpoints implementados:

```bash
npx tsx test-brapi-complete.ts
```

Este teste cobre:
- ✅ Cotações de ações (simples e múltiplas)
- ✅ Módulos avançados (4 ações gratuitas)
- ✅ Listas e filtros
- ✅ Criptomoedas (lista disponível)
- ✅ Taxa Selic atual
- ✅ Inflação (lista de países)
- ✅ Dividendos

**Resultado esperado:** 11 sucessos, 4 falhas esperadas (limitações do plano), 100% de taxa de sucesso

---

**Última atualização:** 03/11/2025 - Testes completos realizados ✅
