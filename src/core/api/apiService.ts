// import axios from 'axios';

// const api = axios.create({
//   timeout: 10000,
//   baseURL: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados',
// });

export interface SelicRate {
  data: string;
  valor: number;
}

export interface IpcaData {
  data: string;
  valor: number;
}

export interface B3Data {
  ticker: string;
  price: number;
  variation: number;
}

export const fetchSelicRate = async (): Promise<SelicRate[]> => {
  // Mock da resposta do BACEN
  return [
    {data: '2024-01-01', valor: 10.75},
    {data: '2024-02-01', valor: 10.50},
  ];
};

export const fetchIpcaData = async (): Promise<IpcaData[]> => {
  // Mock da resposta do IBGE
  return [
    {data: '2024-01-01', valor: 0.42},
    {data: '2024-02-01', valor: 0.83},
  ];
};

export const fetchB3Data = async (ticker: string): Promise<B3Data> => {
  // Mock com dados aleatórios
  const basePrice = Math.random() * 100 + 10;
  const variation = (Math.random() - 0.5) * 10;
  
  return {
    ticker: ticker.toUpperCase(),
    price: Number(basePrice.toFixed(2)),
    variation: Number(variation.toFixed(2)),
  };
};
