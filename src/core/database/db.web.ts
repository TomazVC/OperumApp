// Mock do SQLite para web
export interface User {
  id: number;
  cpf: string;
  name: string;
  email?: string;
  riskProfile?: string;
  objectives?: string;
  createdAt: string;
}

export interface PortfolioItem {
  id: number;
  userId: number;
  assetName: string;
  assetType?: string;
  amount: number;
}

// Mock do banco de dados em memória
let users: User[] = [];
let portfolios: PortfolioItem[] = [];
let nextUserId = 1;
let nextPortfolioId = 1;

export const openDatabase = () => {
  return {
    transaction: (callback: (tx: any) => void) => {
      const mockTx = {
        executeSql: (sql: string, params: any[], successCallback?: (tx: any, result: any) => void, errorCallback?: (tx: any, error: any) => boolean) => {
          try {
            // Simular execução de SQL
            if (sql.includes('CREATE TABLE')) {
              // Ignorar criação de tabelas no mock
              if (successCallback) successCallback(null, { rows: { length: 0 } });
            } else if (sql.includes('INSERT INTO users')) {
              const user: User = {
                id: nextUserId++,
                cpf: params[0],
                name: params[1],
                email: params[2],
                riskProfile: params[3],
                objectives: params[4],
                createdAt: new Date().toISOString()
              };
              users.push(user);
              if (successCallback) successCallback(null, { insertId: user.id });
            } else if (sql.includes('INSERT INTO portfolios')) {
              const item: PortfolioItem = {
                id: nextPortfolioId++,
                userId: params[0],
                assetName: params[1],
                assetType: params[2],
                amount: params[3]
              };
              portfolios.push(item);
              if (successCallback) successCallback(null, { insertId: item.id });
            } else if (sql.includes('SELECT * FROM users WHERE cpf')) {
              const user = users.find(u => u.cpf === params[0]);
              if (successCallback) {
                successCallback(null, {
                  rows: {
                    length: user ? 1 : 0,
                    item: (index: number) => user || null
                  }
                });
              }
            } else if (sql.includes('SELECT * FROM portfolios WHERE userId')) {
              const userPortfolios = portfolios.filter(p => p.userId === params[0]);
              if (successCallback) {
                successCallback(null, {
                  rows: {
                    length: userPortfolios.length,
                    item: (index: number) => userPortfolios[index] || null
                  }
                });
              }
            }
          } catch (error) {
            if (errorCallback) errorCallback(null, error);
          }
        }
      };
      callback(mockTx);
    }
  };
};

export const setupDatabase = (): void => {
  // Inicializar dados mock
  users = [];
  portfolios = [];
  nextUserId = 1;
  nextPortfolioId = 1;
};

export const insertUser = (user: Omit<User, 'id' | 'createdAt'>): number => {
  const newUser: User = {
    id: nextUserId++,
    cpf: user.cpf,
    name: user.name,
    email: user.email,
    riskProfile: user.riskProfile,
    objectives: user.objectives,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  return newUser.id;
};

export const getUserByCPF = (cpf: string): User | null => {
  return users.find(u => u.cpf === cpf) || null;
};

export const listPortfolioByUserId = (userId: number): PortfolioItem[] => {
  return portfolios.filter(p => p.userId === userId);
};

export const insertPortfolioItem = (item: Omit<PortfolioItem, 'id'>): number => {
  const newItem: PortfolioItem = {
    id: nextPortfolioId++,
    userId: item.userId,
    assetName: item.assetName,
    assetType: item.assetType,
    amount: item.amount
  };
  portfolios.push(newItem);
  return newItem.id;
};
