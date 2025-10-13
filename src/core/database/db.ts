import * as SQLite from 'expo-sqlite';
import {Platform} from 'react-native';

const DB_NAME = 'operum.db';
let db: SQLite.SQLiteDatabase | null = null;

// Detectar se estamos na web
const isWeb = Platform.OS === 'web';

// Implementação web em memória
let webUsers: any[] = [];
let webPortfolios: any[] = [];
let webCache: {[key: string]: {value: string; updatedAt: number}} = {};
let nextUserId = 1;
let nextPortfolioId = 1;

export const openDatabase = (): SQLite.SQLiteDatabase => {
  console.log('🔍 openDatabase chamado - Plataforma:', Platform.OS, 'isWeb:', isWeb);
  
  if (isWeb) {
    console.log('🌐 Usando implementação WEB do banco');
    console.log('📊 Estado atual do banco web:', {
      totalUsers: webUsers.length,
      totalPortfolios: webPortfolios.length,
      nextUserId,
      nextPortfolioId
    });
    
    // Na web, retornar implementação mock
    return {
      runSync: (sql: string, params: any[] = []) => {
        console.log('🔧 WEB DB runSync:', { sql: sql.substring(0, 50) + '...', params });
        
        if (sql.includes('CREATE TABLE')) {
          console.log('📋 Criando tabela (ignorado na web)');
          return { lastInsertRowId: 0 };
        } else if (sql.includes('INSERT INTO users')) {
          const user = {
            id: nextUserId++,
            cpf: params[0],
            name: params[1],
            email: params[2],
            passwordHash: params[3],
            salt: params[4],
            riskProfile: params[5],
            objectives: params[6],
            firstLogin: params[7],
            createdAt: new Date().toISOString()
          };
          
          console.log('👤 WEB DB: Salvando usuário:', {
            id: user.id,
            name: user.name,
            email: user.email,
            hasPasswordHash: !!user.passwordHash,
            hasSalt: !!user.salt
          });
          
          webUsers.push(user);
          return { lastInsertRowId: user.id };
        } else if (sql.includes('INSERT INTO portfolios')) {
          const item = {
            id: nextPortfolioId++,
            userId: params[0],
            assetName: params[1],
            assetType: params[2],
            amount: params[3],
            isDemo: params[4]
          };
          webPortfolios.push(item);
          return { lastInsertRowId: item.id };
        } else if (sql.includes('REPLACE INTO cache')) {
          webCache[params[0]] = { value: params[1], updatedAt: params[2] };
          return { lastInsertRowId: 0 };
        } else if (sql.includes('DELETE FROM')) {
          if (sql.includes('users')) {
            const userId = params[0];
            webUsers = webUsers.filter(u => u.id !== userId);
            webPortfolios = webPortfolios.filter(p => p.userId !== userId);
          }
          return { lastInsertRowId: 0 };
        }
        return { lastInsertRowId: 0 };
      },
      getFirstSync: (sql: string, params: any[] = []) => {
        console.log('🔍 WEB DB getFirstSync:', { sql: sql.substring(0, 50) + '...', params });
        
        if (sql.includes('SELECT * FROM users WHERE email')) {
          const user = webUsers.find(u => u.email === params[0]) || null;
          console.log('👤 WEB DB: Buscando usuário por email:', {
            email: params[0],
            found: !!user,
            totalUsers: webUsers.length,
            userData: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              hasPasswordHash: !!user.passwordHash,
              hasSalt: !!user.salt
            } : null
          });
          return user;
        } else if (sql.includes('SELECT * FROM users WHERE cpf')) {
          const user = webUsers.find(u => u.cpf === params[0]) || null;
          console.log('👤 WEB DB: Buscando usuário por CPF:', {
            cpf: params[0],
            found: !!user
          });
          return user;
        } else if (sql.includes('SELECT value, updatedAt FROM cache')) {
          return webCache[params[0]] || null;
        }
        return null;
      },
      getAllSync: (sql: string, params: any[] = []) => {
        console.log('📋 WEB DB getAllSync:', { sql: sql.substring(0, 50) + '...', params });
        
        if (sql.includes('SELECT * FROM portfolios WHERE userId')) {
          return webPortfolios.filter(p => p.userId === params[0]);
        } else if (sql.includes('SELECT * FROM users ORDER BY createdAt DESC')) {
          console.log('👥 WEB DB: Retornando todos os usuários:', webUsers.length);
          return [...webUsers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return [];
      },
      transaction: () => {},
    } as any;
  }
  
  console.log('📱 Usando implementação MOBILE do banco (SQLite)');
  if (db) return db;
  db = SQLite.openDatabaseSync(DB_NAME);
  return db;
};

export const setupDatabase = (): void => {
  const database = openDatabase();
  
  try {
    // users: add auth fields and firstLogin flag
    database.runSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cpf TEXT UNIQUE,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        passwordHash TEXT,
        salt TEXT,
        riskProfile TEXT,
        objectives TEXT,
        firstLogin INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
      );
    `);

    // portfolios (positions)
    database.runSync(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        assetName TEXT NOT NULL,
        assetType TEXT,
        amount REAL,
        isDemo INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // simple persistent cache for quotes/macro values
    database.runSync(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT,
        updatedAt INTEGER
      );
    `);

    // answers for risk questionnaire
    database.runSync(`
      CREATE TABLE IF NOT EXISTS user_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        questionId TEXT,
        answer TEXT,
        score INTEGER,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
};

export interface User {
  id: number;
  cpf: string;
  name: string;
  email?: string;
  passwordHash?: string;
  salt?: string;
  riskProfile?: string;
  objectives?: string;
  firstLogin?: number;
  createdAt: string;
}

export interface PortfolioItem {
  id: number;
  userId: number;
  assetName: string;
  assetType?: string;
  amount: number;
  isDemo?: number;
}

export const insertUser = (user: Omit<User, 'id' | 'createdAt'>): number => {
  console.log('💾 insertUser chamado com dados:', {
    name: user.name,
    email: user.email,
    hasPasswordHash: !!user.passwordHash,
    hasSalt: !!user.salt
  });
  
  const database = openDatabase();
  
  // Debug: verificar estado antes da inserção
  if (Platform.OS === 'web') {
    console.log('🌐 Estado do banco ANTES da inserção:', {
      totalUsers: webUsers.length,
      users: webUsers.map(u => ({ id: u.id, email: u.email, name: u.name }))
    });
  }
  
  try {
    const result = database.runSync(
      'INSERT INTO users (cpf, name, email, passwordHash, salt, riskProfile, objectives, firstLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user.cpf || null, user.name, user.email || null, user.passwordHash || null, user.salt || null, user.riskProfile || null, user.objectives || null, user.firstLogin ?? 1]
    );
    
    // Debug: verificar estado após a inserção
    if (Platform.OS === 'web') {
      console.log('🌐 Estado do banco APÓS a inserção:', {
        totalUsers: webUsers.length,
        users: webUsers.map(u => ({ id: u.id, email: u.email, name: u.name })),
        newUserId: result.lastInsertRowId
      });
    }
    
    console.log('✅ Usuário inserido com ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error inserting user:', error);
    throw error;
  }
};

export const getUserByCPF = (cpf: string): User | null => {
  const database = openDatabase();
  
  try {
    const result = database.getFirstSync(
      'SELECT * FROM users WHERE cpf = ?',
      [cpf]
    );
    return result || null;
  } catch (error) {
    console.error('Error getting user by CPF:', error);
    return null;
  }
};

export const getUserByEmail = (email: string): User | null => {
  console.log('🔍 getUserByEmail chamado com email:', email);
  console.log('🔍 getUserByEmail - Função exportada corretamente');
  
  const database = openDatabase();
  console.log('🔍 Database obtido:', typeof database);
  console.log('🔍 Database tem getFirstSync?', typeof database.getFirstSync);
  
  // Debug: verificar estado atual do banco web
  if (Platform.OS === 'web') {
    console.log('🌐 Estado atual do banco web:', {
      totalUsers: webUsers.length,
      users: webUsers.map(u => ({ id: u.id, email: u.email, name: u.name }))
    });
  }
  
  try {
    const result = database.getFirstSync(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    console.log('🔍 Resultado da busca:', result);
    return result || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

export const updateUser = (userId: number, data: Partial<Pick<User, 'name' | 'email' | 'riskProfile'>>): void => {
  const database = openDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
  if (data.riskProfile !== undefined) { fields.push('riskProfile = ?'); values.push(data.riskProfile); }
  if (fields.length === 0) return;
  values.push(userId);
  
  try {
    database.runSync(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUserById = (userId: number): void => {
  const database = openDatabase();
  
  try {
    database.runSync('DELETE FROM portfolios WHERE userId = ?', [userId]);
    database.runSync('DELETE FROM user_answers WHERE userId = ?', [userId]);
    database.runSync('DELETE FROM users WHERE id = ?', [userId]);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const listPortfolioByUserId = (userId: number): PortfolioItem[] => {
  const database = openDatabase();
  
  try {
    const result = database.getAllSync(
      'SELECT * FROM portfolios WHERE userId = ?',
      [userId]
    );
    return result || [];
  } catch (error) {
    console.error('Error listing portfolio:', error);
    return [];
  }
};

export const insertPortfolioItem = (item: Omit<PortfolioItem, 'id'>): number => {
  const database = openDatabase();
  
  try {
    const result = database.runSync(
      'INSERT INTO portfolios (userId, assetName, assetType, amount, isDemo) VALUES (?, ?, ?, ?, ?)',
      [item.userId, item.assetName, item.assetType || null, item.amount, item.isDemo ?? 0]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error inserting portfolio item:', error);
    throw error;
  }
};

// Persistent cache helpers
export const getCache = (key: string): {value: string; updatedAt: number} | null => {
  const database = openDatabase();
  
  try {
    const result = database.getFirstSync(
      'SELECT value, updatedAt FROM cache WHERE key = ? LIMIT 1',
      [key]
    );
    return result || null;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
};

export const setCache = (key: string, value: string, updatedAt: number): void => {
  const database = openDatabase();
  
  try {
    database.runSync(
      'REPLACE INTO cache (key, value, updatedAt) VALUES (?, ?, ?)',
      [key, value, updatedAt]
    );
  } catch (error) {
    console.error('Error setting cache:', error);
    throw error;
  }
};
