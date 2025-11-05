# 📈 AÇÕES - BRAPI API (Plano Basic)

**Data:** 03 de Novembro de 2025  
**Token:** fQZNiALmLqMRjjeypszzpa (ou 83ggNqPt65fEAYG7EhrWEr - idênticos)

---

## 🎯 O QUE FUNCIONA NO PLANO BASIC

### 1️⃣ 4 AÇÕES DE TESTE - Acesso TOTAL sem token

Estas 4 ações têm **acesso completo e irrestrito** a TODOS os recursos, **SEM NECESSIDADE DE TOKEN**:

- **PETR4** (Petrobras PN)
- **MGLU3** (Magazine Luiza ON)
- **VALE3** (Vale ON)
- **ITUB4** (Itaú Unibanco PN)

#### ✅ O que funciona SEM TOKEN:
```typescript
// Cotação básica
const petr4 = await getStockQuote('PETR4');

// Com TODOS os módulos avançados
const itub4Full = await getStockQuoteWithModules('ITUB4', {
  modules: [
    'summaryProfile',              // Perfil da empresa
    'balanceSheetHistory',         // Balanço Patrimonial (anual)
    'balanceSheetHistoryQuarterly', // Balanço Patrimonial (trimestral)
    'incomeStatementHistory',      // DRE (anual)
    'incomeStatementHistoryQuarterly', // DRE (trimestral)
    'cashflowHistory',             // DFC (anual)
    'cashflowHistoryQuarterly',    // DFC (trimestral)
    'financialData',               // EBITDA, ROE, margens (TTM)
    'defaultKeyStatistics'         // P/L, Dividend Yield, etc (TTM)
  ],
  fundamental: true,  // P/L e LPA básicos
  dividends: true,    // Histórico completo de dividendos
  range: '1y',        // Histórico de 1 ano
  interval: '1d'      // Preços diários
});
```

**Resultado:** ✅ TUDO funciona perfeitamente!

---

### 2️⃣ TODAS as 1854+ AÇÕES DA B3 - Acesso PARCIAL com token

Para **qualquer outra ação** além das 4 de teste, você precisa de **token** e tem **acesso limitado**:

#### ✅ O que funciona COM TOKEN:

```typescript
// 1. Cotação básica (preço, variação, volume, máximas, mínimas)
const wege3 = await getStockQuote('WEGE3');
console.log(wege3.price);           // R$ 42.80
console.log(wege3.change);          // +0.55%
console.log(wege3.volume);          // 12,345,678
console.log(wege3.regularMarketDayHigh);  // R$ 43.20
console.log(wege3.regularMarketDayLow);   // R$ 42.50

// 2. Múltiplas ações de uma vez
const stocks = await getMultipleStocks(['PETR4', 'VALE3', 'ITUB4']);

// 3. Histórico de preços
const bbas3 = await getStockQuote('BBAS3', {
  range: '1mo',      // Último mês
  interval: '1d'     // Preços diários
});
console.log(bbas3.historicalDataPrice);  // Array com preços históricos

// 4. Dados fundamentalistas BÁSICOS (sem módulos)
const ggbr4 = await getStockQuote('GGBR4', {
  fundamental: true  // Retorna P/L e LPA básicos
});
console.log(ggbr4.priceEarnings);     // P/L
console.log(ggbr4.earningsPerShare);  // LPA

// 5. Histórico COMPLETO de dividendos
const itsa4 = await getStockQuote('ITSA4', {
  dividends: true
});
console.log(itsa4.dividendsData.cashDividends);  // Array completo

// 6. Lista filtrada de ações
const topFinance = await getStockList({
  sector: 'Finance',       // Setor financeiro
  sortBy: 'volume',        // Ordenar por volume
  sortOrder: 'desc',       // Decrescente
  limit: 10                // Top 10
});

const allStocks = await getStockList({
  limit: 100,              // Primeiras 100
  sortBy: 'marketCap',     // Ordenar por valor de mercado
  sortOrder: 'desc'
});
```

**Resultado:** ✅ Cotações, histórico, dividendos e listas funcionam!

---

#### ❌ O que NÃO funciona (requer upgrade):

```typescript
// Módulos avançados para ações além das 4 de teste
const wege3Full = await getStockQuoteWithModules('WEGE3', {
  modules: ['summaryProfile']  // ❌ 403 Forbidden
});

const bbas3Full = await getStockQuoteWithModules('BBAS3', {
  modules: ['balanceSheetHistory']  // ❌ 403 Forbidden
});

const vale3Full = await getStockQuoteWithModules('VALE3', {
  modules: ['incomeStatementHistory']  // ❌ 403 Forbidden
});

const itub4Full = await getStockQuoteWithModules('ITUB4', {
  modules: ['financialData']  // ❌ 403 Forbidden
});
```

**Erro:** `403 Forbidden - O seu plano não permite acessar dados do módulo...`

**Módulos bloqueados para ações além das 4 de teste:**
- ❌ `summaryProfile` - Perfil da empresa
- ❌ `balanceSheetHistory` - Balanço Patrimonial (anual)
- ❌ `balanceSheetHistoryQuarterly` - Balanço Patrimonial (trimestral)
- ❌ `incomeStatementHistory` - DRE (anual)
- ❌ `incomeStatementHistoryQuarterly` - DRE (trimestral)
- ❌ `cashflowHistory` - DFC (anual)
- ❌ `cashflowHistoryQuarterly` - DFC (trimestral)
- ❌ `financialData` - Dados financeiros (EBITDA, ROE, margens)
- ❌ `defaultKeyStatistics` - Estatísticas avançadas (P/L detalhado, etc)
- ❌ `valueAddedHistory` - DVA (anual)
- ❌ `valueAddedHistoryQuarterly` - DVA (trimestral)

---

## 📊 ENDPOINT `/quote/list` - Listagem e Filtros

### Parâmetros disponíveis:

```typescript
interface StockListParams {
  search?: string;        // Busca por ticker (ex: 'PETR')
  sortBy?: string;        // Campo de ordenação
  sortOrder?: 'asc' | 'desc';  // Ordem
  limit?: number;         // Limite de resultados
  page?: number;          // Página (paginação)
  type?: 'stock' | 'fund' | 'bdr';  // Tipo de ativo
  sector?: string;        // Setor (ex: 'Finance', 'Energy Minerals')
}
```

### Valores válidos para `sortBy`:
- `name` - Nome da ação
- `close` - Preço de fechamento
- `change` - Variação percentual
- `volume` - Volume negociado
- `market_cap_basic` - Valor de mercado
- `sector` - Setor

### Setores disponíveis (parcial):
- `Finance`
- `Energy Minerals`
- `Technology Services`
- `Consumer Non-Durables`
- `Health Technology`
- `Industrial Services`
- `Process Industries`
- `Electronic Technology`
- `Retail Trade`
- ... e mais 20+ setores

### Tipos de ativos:
- `stock` - Ações ordinárias e preferenciais
- `fund` - Fundos Imobiliários (FIIs)
- `bdr` - Brazilian Depositary Receipts

### Exemplos práticos:

```typescript
// Top 10 ações por volume
const topVolume = await getStockList({
  type: 'stock',
  sortBy: 'volume',
  sortOrder: 'desc',
  limit: 10
});

// Todas as ações do setor financeiro
const finance = await getStockList({
  sector: 'Finance',
  type: 'stock',
  sortBy: 'marketCap',
  sortOrder: 'desc'
});

// Top 20 FIIs por valor de mercado
const topFIIs = await getStockList({
  type: 'fund',
  sortBy: 'market_cap_basic',
  sortOrder: 'desc',
  limit: 20
});

// Buscar ações da Petrobras
const petro = await getStockList({
  search: 'PETR',
  type: 'stock'
});
// Retorna: PETR3, PETR4

// Paginação (página 2, 50 por página)
const page2 = await getStockList({
  limit: 50,
  page: 2,
  sortBy: 'name',
  sortOrder: 'asc'
});
```

---

## 🎯 RECOMENDAÇÕES PARA O OPERUMAPP

### Para exibir dados completos:
**Use apenas as 4 ações de teste:**
```typescript
const freeStocks = ['PETR4', 'MGLU3', 'VALE3', 'ITUB4'];

// Buscar dados completos
const fullData = await Promise.all(
  freeStocks.map(ticker => 
    getStockQuoteWithModules(ticker, {
      modules: [
        'summaryProfile',
        'balanceSheetHistory',
        'incomeStatementHistory',
        'financialData',
        'defaultKeyStatistics'
      ],
      dividends: true,
      range: '1y',
      interval: '1d'
    })
  )
);
```

### Para exibir cotações simples:
**Use QUALQUER ação:**
```typescript
const topStocks = await getStockList({
  sortBy: 'volume',
  sortOrder: 'desc',
  limit: 20
});

// Buscar detalhes de cada uma
const quotes = await Promise.all(
  topStocks.map(stock => 
    getStockQuote(stock.ticker, {
      fundamental: true,  // P/L e LPA básicos
      dividends: true     // Histórico de dividendos
    })
  )
);
```

### Para demonstração de módulos avançados:
**Mostre apenas as 4 ações gratuitas com explicação:**
```typescript
// UI Component
<Alert type="info">
  📊 Dados financeiros completos disponíveis apenas para:
  PETR4, MGLU3, VALE3, ITUB4
  
  Outras ações mostram: cotação, histórico e dividendos.
</Alert>

<StockSelector
  freeStocks={['PETR4', 'MGLU3', 'VALE3', 'ITUB4']}
  showFullData={true}
/>

<StockList
  allStocks={topStocks}
  showBasicData={true}
/>
```

---

## 📝 RESUMO

### ✅ PLANO BASIC - O que você TEM:
1. **4 ações gratuitas** com acesso total a TODOS os módulos (PETR4, MGLU3, VALE3, ITUB4)
2. **1854+ ações** com cotações, histórico e dividendos
3. **Filtros avançados** por setor, tipo, volume, valor de mercado
4. **Histórico de preços** (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
5. **Histórico completo de dividendos** para todas as ações
6. **Dados fundamentalistas básicos** (P/L, LPA) para todas as ações

### ❌ PLANO BASIC - O que você NÃO TEM:
1. Módulos avançados (BP, DRE, DFC, EBITDA, ROE) para ações além das 4 gratuitas
2. Consultas múltiplas de módulos (mais de 1 módulo por vez requer upgrade)
3. Suporte técnico prioritário

### 💰 Para ter acesso completo:
- Upgrade para plano **PRO** ou **PREMIUM**
- Acesso a TODOS os módulos para TODAS as ações
- Sem limitações

---

## 🔗 Links úteis

- **Documentação oficial:** https://brapi.dev/docs/acoes
- **Dashboard:** https://brapi.dev/dashboard
- **Swagger:** https://brapi.dev/swagger

---

**Última atualização:** 03/11/2025
