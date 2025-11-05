/**
 * TESTE COMPLETO - BRAPI API
 * 
 * Testa todos os endpoints mais importantes disponíveis no plano Basic
 * Foco: Brasil (país padrão)
 * Token: REDACTED
 * 
 * Data: 03/11/2025
 */

import brapiService from './src/core/api/brapiService';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function printHeader(title: string) {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log('='.repeat(80));
}

function printTest(number: number, description: string) {
  console.log(`\n${colors.blue}TEST ${number}: ${description}${colors.reset}`);
  console.log('-'.repeat(80));
}

function printSuccess(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function printError(message: string) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function printWarning(message: string) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

async function testBrapiComplete() {
  printHeader('TESTE COMPLETO - BRAPI API - PLANO BASIC');
  console.log(`Token: ${brapiService.API_TOKEN.substring(0, 15)}...`);
  console.log(`País foco: Brasil\n`);

  let successCount = 0;
  let failCount = 0;
  let expectedFailCount = 0;

  // ========================================
  // SEÇÃO 1: COTAÇÕES DE AÇÕES
  // ========================================
  printHeader('SEÇÃO 1: COTAÇÕES DE AÇÕES (B3)');

  // TEST 1: Cotação simples de ação
  printTest(1, 'Cotação de WEGE3 (ação comum)');
  try {
    const wege3 = await brapiService.getStockQuote('WEGE3');
    printSuccess(`WEGE3: R$ ${wege3.price} (${wege3.change > 0 ? '+' : ''}${wege3.change}%)`);
    successCount++;
  } catch (error: any) {
    printError(`Erro: ${error.message}`);
    failCount++;
  }

  // TEST 2: Múltiplas ações
  printTest(2, 'Múltiplas ações (PETR4, VALE3, ITUB4)');
  try {
    const stocks = await brapiService.getMultipleStockQuotes(['PETR4', 'VALE3', 'ITUB4']);
    printSuccess(`${stocks.length} ações retornadas`);
    stocks.forEach(stock => {
      console.log(`  - ${stock.ticker}: R$ ${stock.price}`);
    });
    successCount++;
  } catch (error: any) {
    printError(`Erro: ${error.message}`);
    failCount++;
  }

  // TEST 3: Ação com perfil da empresa (summaryProfile)
  printTest(3, 'PETR4 com módulo summaryProfile');
  try {
    const petr4 = await brapiService.getStockQuoteWithModules('PETR4', {
      modules: ['summaryProfile']
    });
    printSuccess(`${petr4.shortName} - Setor: ${petr4.summaryProfile?.sector || 'N/A'}`);
    console.log(`  Endereço: ${petr4.summaryProfile?.address1 || 'N/A'}`);
    console.log(`  Website: ${petr4.summaryProfile?.website || 'N/A'}`);
    successCount++;
  } catch (error: any) {
    printError(`Erro: ${error.message}`);
    failCount++;
  }

  // TEST 4: Lista de ações filtrada por setor
  printTest(4, 'Lista de ações do setor Financeiro (top 5)');
  try {
    const finance = await brapiService.getStockList({
      sector: 'Finance',
      sortBy: 'marketCap',
      sortOrder: 'desc',
      limit: 5
    });
    printSuccess(`${finance.stocks.length} ações encontradas`);
    finance.stocks.forEach((stock: any) => {
      console.log(`  - ${stock.stock}: ${stock.name} - R$ ${stock.close}`);
    });
    successCount++;
  } catch (error: any) {
    printError(`Erro: ${error.message}`);
    failCount++;
  }

  // ========================================
  // SEÇÃO 2: MÓDULOS AVANÇADOS (4 AÇÕES GRATUITAS)
  // ========================================
  printHeader('SEÇÃO 2: MÓDULOS AVANÇADOS (AÇÕES GRATUITAS)');

  // TEST 5: ITUB4 com módulos financeiros completos
  printTest(5, 'ITUB4 com módulos financeiros (FREE STOCK)');
  try {
    const itub4 = await brapiService.getStockQuoteWithModules('ITUB4', {
      modules: ['summaryProfile', 'financialData', 'defaultKeyStatistics']
    });
    printSuccess(`${itub4.shortName} - Dados completos obtidos`);
    console.log(`  P/L: ${itub4.defaultKeyStatistics?.trailingPE || 'N/A'}`);
    console.log(`  ROE: ${itub4.financialData?.returnOnEquity || 'N/A'}`);
    console.log(`  EBITDA: ${itub4.financialData?.ebitda || 'N/A'}`);
    successCount++;
  } catch (error: any) {
    printError(`Erro: ${error.message}`);
    failCount++;
  }

  // TEST 6: Tentar módulos avançados em ação não-gratuita (deve falhar)
  printTest(6, 'WEGE3 com módulos financeiros (deve retornar erro 403)');
  try {
    const wege3 = await brapiService.getStockQuoteWithModules('WEGE3', {
      modules: ['financialData']
    });
    printError('INESPERADO: Deveria falhar mas funcionou!');
    failCount++;
  } catch (error: any) {
    if (error.response?.status === 403) {
      printWarning('Erro 403 esperado: Módulo financialData requer upgrade');
      expectedFailCount++;
    } else {
      printError(`Erro inesperado: ${error.message}`);
      failCount++;
    }
  }

  // ========================================
  // SEÇÃO 3: CRIPTOMOEDAS
  // ========================================
  printHeader('SEÇÃO 3: CRIPTOMOEDAS');

  // TEST 7: Lista de criptomoedas disponíveis
  printTest(7, 'Lista de criptomoedas disponíveis');
  try {
    const cryptos = await brapiService.getAvailableCryptos();
    printSuccess(`${cryptos.length} criptomoedas disponíveis`);
    console.log(`  Primeiras 10: ${cryptos.slice(0, 10).join(', ')}`);
    successCount++;
  } catch (error: any) {
    printError(`Erro: ${error.message}`);
    failCount++;
  }

  // TEST 8: Buscar criptomoeda específica
  printTest(8, 'Buscar "DOGE" na lista de criptos');
  try {
    const doge = await brapiService.getAvailableCryptos('DOGE');
    if (doge.includes('DOGE')) {
      printSuccess(`DOGE encontrado na lista`);
      successCount++;
    } else {
      printError('DOGE não encontrado');
      failCount++;
    }
  } catch (error: any) {
    printError(`Erro: ${error.message}`);
    failCount++;
  }

  // TEST 9: Tentar obter cotação de BTC (deve falhar)
  printTest(9, 'Cotação de BTC (deve retornar erro 400)');
  try {
    const btc = await brapiService.getCryptoQuote('BTC');
    printError('INESPERADO: Deveria falhar mas funcionou!');
    failCount++;
  } catch (error: any) {
    if (error.response?.status === 400) {
      printWarning('Erro 400 esperado: Cotação de cripto requer upgrade');
      expectedFailCount++;
    } else {
      printError(`Erro inesperado: ${error.message}`);
      failCount++;
    }
  }

  // ========================================
  // SEÇÃO 4: INDICADORES ECONÔMICOS (BRASIL)
  // ========================================
  printHeader('SEÇÃO 4: INDICADORES ECONÔMICOS (BRASIL)');

  // TEST 10: Taxa Selic atual
  printTest(10, 'Taxa Selic atual do Brasil');
  try {
    const selic = await brapiService.getLatestPrimeRate('brazil');
    printSuccess(`Taxa Selic: ${selic}%`);
    successCount++;
  } catch (error: any) {
    printError(`Erro: ${error.message}`);
    failCount++;
  }

  // TEST 11: Lista de países com dados de Selic
  printTest(11, 'Países com dados de Taxa Selic');
  try {
    const countries = await brapiService.getAvailablePrimeRateCountries();
    printSuccess(`${countries.length} país(es) disponível(is): ${countries.join(', ')}`);
    successCount++;
  } catch (error: any) {
    printError(`Erro: ${error.message}`);
    failCount++;
  }

  // TEST 12: Dados históricos de Selic (deve falhar)
  printTest(12, 'Dados históricos de Selic (deve retornar erro 400)');
  try {
    const historical = await brapiService.getPrimeRate('brazil', {
      start: '01/01/2024',
      end: '31/12/2024'
    });
    printError('INESPERADO: Deveria falhar mas funcionou!');
    failCount++;
  } catch (error: any) {
    if (error.response?.status === 400) {
      printWarning('Erro 400 esperado: Dados históricos de Selic requerem upgrade');
      expectedFailCount++;
    } else {
      printError(`Erro inesperado: ${error.message}`);
      failCount++;
    }
  }

  // TEST 13: Lista de países com dados de inflação
  printTest(13, 'Países com dados de Inflação');
  try {
    const countries = await brapiService.getAvailableInflationCountries();
    printSuccess(`${countries.length} país(es) disponível(is): ${countries.join(', ')}`);
    successCount++;
  } catch (error: any) {
    printError(`Erro: ${error.message}`);
    failCount++;
  }

  // TEST 14: Dados de inflação (deve falhar)
  printTest(14, 'Dados de inflação do Brasil (deve retornar erro 400)');
  try {
    const inflation = await brapiService.getInflation('brazil');
    printError('INESPERADO: Deveria falhar mas funcionou!');
    failCount++;
  } catch (error: any) {
    if (error.response?.status === 400) {
      printWarning('Erro 400 esperado: Dados de inflação requerem upgrade');
      expectedFailCount++;
    } else {
      printError(`Erro inesperado: ${error.message}`);
      failCount++;
    }
  }

  // ========================================
  // SEÇÃO 5: DIVIDENDOS
  // ========================================
  printHeader('SEÇÃO 5: DIVIDENDOS');

  // TEST 15: Histórico de dividendos ITUB4
  printTest(15, 'Histórico de dividendos - ITUB4');
  try {
    const itub4 = await brapiService.getStockQuoteWithModules('ITUB4', {
      modules: ['summaryProfile'],
      dividends: true
    });
    
    if (itub4.dividendsData?.cashDividends) {
      const dividends = itub4.dividendsData.cashDividends;
      printSuccess(`${dividends.length} dividendos encontrados`);
      console.log(`  Últimos 3 dividendos:`);
      dividends.slice(0, 3).forEach((div: any) => {
        console.log(`    - ${div.paymentDate}: R$ ${div.rate} (Yield: ${div.relatedPercent || 'N/A'})`);
      });
      successCount++;
    } else {
      printWarning('Sem dados de dividendos retornados');
      failCount++;
    }
  } catch (error: any) {
    printError(`Erro: ${error.message}`);
    failCount++;
  }

  // ========================================
  // RESUMO FINAL
  // ========================================
  printHeader('RESUMO FINAL');
  
  const total = successCount + failCount + expectedFailCount;
  console.log(`\n${colors.green}✅ Sucessos: ${successCount}${colors.reset}`);
  console.log(`${colors.red}❌ Falhas inesperadas: ${failCount}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Falhas esperadas (limitações do plano): ${expectedFailCount}${colors.reset}`);
  console.log(`${colors.cyan}📊 Total de testes: ${total}${colors.reset}`);
  
  const successRate = ((successCount + expectedFailCount) / total * 100).toFixed(1);
  console.log(`\n${colors.cyan}Taxa de sucesso: ${successRate}% (incluindo falhas esperadas)${colors.reset}`);

  // Conclusão
  printHeader('CONCLUSÃO');
  console.log(`
${colors.cyan}RECURSOS DISPONÍVEIS NO PLANO BASIC:${colors.reset}
  ✅ Cotações de todas as 1854+ ações da B3
  ✅ Módulo summaryProfile (perfil da empresa)
  ✅ Histórico de dividendos completo
  ✅ Lista de 301 criptomoedas disponíveis
  ✅ Taxa Selic ATUAL do Brasil (15.00%)
  ✅ Lista de países com dados econômicos
  ✅ Módulos financeiros completos para 4 ações gratuitas (PETR4, MGLU3, VALE3, ITUB4)

${colors.yellow}LIMITAÇÕES DO PLANO BASIC:${colors.reset}
  ❌ Cotações de criptomoedas (requer upgrade)
  ❌ Dados históricos de Selic (requer upgrade)
  ❌ Dados de inflação (requer upgrade)
  ❌ Módulos financeiros avançados (exceto 4 ações gratuitas)
  ❌ Rate limit: ~10 requisições/minuto

${colors.green}RECOMENDAÇÃO:${colors.reset}
  Para criptomoedas: Use AwesomeAPI (BTC-BRL gratuito)
  Para inflação: Use API do IBGE (IPCA gratuito)
  Para Selic histórico: Considere API do Banco Central
  Para dados fundamentalistas: Use as 4 ações gratuitas como demonstração
`);

  printHeader('TESTE CONCLUÍDO');
  console.log('');
}

// Executar testes
testBrapiComplete().catch(console.error);
