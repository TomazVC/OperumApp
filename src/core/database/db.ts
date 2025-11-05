import * as SQLite from 'expo-sqlite';
import {Platform} from 'react-native';

const DB_NAME = 'operum.db';
let db: SQLite.SQLiteDatabase | null = null;

// Detectar se estamos na web
const isWeb = Platform.OS === 'web';

// Implementação web com localStorage
let webUsers: any[] = [];
let webPortfolios: any[] = [];
let webChatMessages: any[] = [];
let webCache: {[key: string]: {value: string; updatedAt: number}} = {};
let nextUserId = 1;
let nextPortfolioId = 1;
let nextMessageId = 1;

// Funções para persistência com localStorage
const loadFromLocalStorage = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const storedUsers = localStorage.getItem('operum_webUsers');
      const storedPortfolios = localStorage.getItem('operum_webPortfolios');
      const storedChatMessages = localStorage.getItem('operum_webChatMessages');
      const storedCache = localStorage.getItem('operum_webCache');
      const storedNextUserId = localStorage.getItem('operum_nextUserId');
      const storedNextPortfolioId = localStorage.getItem('operum_nextPortfolioId');
      const storedNextMessageId = localStorage.getItem('operum_nextMessageId');

      if (storedUsers) {
        webUsers = JSON.parse(storedUsers);
        console.log('📱 Carregados do localStorage:', webUsers.length, 'usuários');
      }
      if (storedPortfolios) {
        webPortfolios = JSON.parse(storedPortfolios);
      }
      if (storedChatMessages) {
        webChatMessages = JSON.parse(storedChatMessages);
      }
      if (storedCache) {
        webCache = JSON.parse(storedCache);
      }
      if (storedNextUserId) {
        nextUserId = parseInt(storedNextUserId);
      }
      if (storedNextPortfolioId) {
        nextPortfolioId = parseInt(storedNextPortfolioId);
      }
      if (storedNextMessageId) {
        nextMessageId = parseInt(storedNextMessageId);
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
  }
};

const saveToLocalStorage = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      localStorage.setItem('operum_webUsers', JSON.stringify(webUsers));
      localStorage.setItem('operum_webPortfolios', JSON.stringify(webPortfolios));
      localStorage.setItem('operum_webChatMessages', JSON.stringify(webChatMessages));
      localStorage.setItem('operum_webCache', JSON.stringify(webCache));
      localStorage.setItem('operum_nextUserId', nextUserId.toString());
      localStorage.setItem('operum_nextPortfolioId', nextPortfolioId.toString());
      localStorage.setItem('operum_nextMessageId', nextMessageId.toString());
      console.log('💾 Dados salvos no localStorage');
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }
};

// Carregar dados do localStorage na inicialização
loadFromLocalStorage();

// Função de debug para verificar estado global
export const debugWebState = () => {
  console.log('🐛 DEBUG - Estado global das variáveis web:', {
    webUsersLength: webUsers.length,
    nextUserId,
    nextPortfolioId,
    users: webUsers.map(u => ({ id: u.id, email: u.email, name: u.name }))
  });
  return {
    webUsersLength: webUsers.length,
    nextUserId,
    nextPortfolioId,
    users: webUsers.map(u => ({ id: u.id, email: u.email, name: u.name }))
  };
};

// Função de teste para criar um usuário de teste
export const createTestUser = () => {
  if (Platform.OS === 'web') {
    console.log('🧪 Criando usuário de teste...');
    const testUser = {
      id: nextUserId++,
      cpf: '12345678901',
      name: 'Usuário Teste',
      email: 'teste@teste.com',
      passwordHash: 'hash_teste',
      salt: 'salt_teste',
      riskProfile: 'moderado',
      objectives: 'crescimento',
      firstLogin: 1,
      createdAt: new Date().toISOString()
    };
    
    webUsers.push(testUser);
    console.log('🧪 Usuário de teste criado:', testUser);
    console.log('🧪 Total de usuários agora:', webUsers.length);
    return testUser;
  }
  return null;
};

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
          
          console.log('📊 ANTES de adicionar - webUsers.length:', webUsers.length);
          webUsers.push(user);
          console.log('📊 APÓS adicionar - webUsers.length:', webUsers.length);
          console.log('📊 Lista completa de usuários:', webUsers.map(u => ({ id: u.id, email: u.email, name: u.name })));
          
          // Salvar no localStorage após inserção
          saveToLocalStorage();
          
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
          saveToLocalStorage();
          return { lastInsertRowId: item.id };
        } else if (sql.includes('REPLACE INTO cache')) {
          webCache[params[0]] = { value: params[1], updatedAt: params[2] };
          saveToLocalStorage();
          return { lastInsertRowId: 0 };
        } else if (sql.includes('UPDATE users SET')) {
          const userId = params[params.length - 1]; // userId é o último parâmetro
          const userIndex = webUsers.findIndex(u => u.id === userId);
          
          if (userIndex !== -1) {
            // Parsear os campos do SQL UPDATE
            const setClause = sql.match(/SET (.+?) WHERE/)?.[1] || '';
            const fields = setClause.split(',').map(f => f.trim().split('=')[0].trim());
            
            // Atualizar campos baseado na posição dos parâmetros
            let paramIndex = 0;
            fields.forEach(field => {
              if (field === 'name' && params[paramIndex] !== undefined) {
                webUsers[userIndex].name = params[paramIndex];
                paramIndex++;
              } else if (field === 'email' && params[paramIndex] !== undefined) {
                webUsers[userIndex].email = params[paramIndex];
                paramIndex++;
              } else if (field === 'cpf' && params[paramIndex] !== undefined) {
                webUsers[userIndex].cpf = params[paramIndex];
                paramIndex++;
              } else if (field === 'phone' && params[paramIndex] !== undefined) {
                webUsers[userIndex].phone = params[paramIndex];
                paramIndex++;
              } else if (field === 'riskProfile' && params[paramIndex] !== undefined) {
                webUsers[userIndex].riskProfile = params[paramIndex];
                paramIndex++;
              } else if (field === 'passwordHash' && params[paramIndex] !== undefined) {
                webUsers[userIndex].passwordHash = params[paramIndex];
                paramIndex++;
              } else if (field === 'salt' && params[paramIndex] !== undefined) {
                webUsers[userIndex].salt = params[paramIndex];
                paramIndex++;
              } else {
                paramIndex++;
              }
            });
            
            saveToLocalStorage();
          }
          return { lastInsertRowId: 0 };
        } else if (sql.includes('DELETE FROM')) {
          if (sql.includes('users')) {
            const userId = params[0];
            webUsers = webUsers.filter(u => u.id !== userId);
            webPortfolios = webPortfolios.filter(p => p.userId !== userId);
          }
          saveToLocalStorage();
          return { lastInsertRowId: 0 };
        }
        return { lastInsertRowId: 0 };
      },
      getFirstSync: (sql: string, params: any[] = []) => {
        console.log('🔍 WEB DB getFirstSync:', { sql: sql.substring(0, 50) + '...', params });
        
        if (sql.includes('SELECT * FROM users WHERE id')) {
          const user = webUsers.find(u => u.id === params[0]) || null;
          console.log('👤 WEB DB: Buscando usuário por ID:', {
            id: params[0],
            found: !!user
          });
          return user;
        } else if (sql.includes('SELECT * FROM users WHERE email')) {
          console.log('🔍 Buscando usuário por email:', params[0]);
          console.log('📊 Estado atual de webUsers:', {
            length: webUsers.length,
            users: webUsers.map(u => ({ id: u.id, email: u.email, name: u.name }))
          });
          
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
        quantity REAL,
        unitPrice REAL,
        expectedReturn REAL,
        createdAt TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Adicionar novos campos se a tabela já existir (migration)
    try {
      database.runSync(`ALTER TABLE portfolios ADD COLUMN quantity REAL;`);
    } catch (e) {
      // Coluna já existe, ignorar
    }
    try {
      database.runSync(`ALTER TABLE portfolios ADD COLUMN unitPrice REAL;`);
    } catch (e) {
      // Coluna já existe, ignorar
    }
    try {
      database.runSync(`ALTER TABLE portfolios ADD COLUMN expectedReturn REAL;`);
    } catch (e) {
      // Coluna já existe, ignorar
    }
    try {
      database.runSync(`ALTER TABLE users ADD COLUMN phone TEXT;`);
    } catch (e) {
      // Coluna já existe, ignorar
    }

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

    // chat messages for chatbot
    database.runSync(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
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
  phone?: string;
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
  quantity?: number;
  unitPrice?: number;
  expectedReturn?: number;
}

export interface ChatMessage {
  id: number;
  userId: number;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const insertUser = (user: Omit<User, 'id' | 'createdAt'>): number => {
  console.log('💾 insertUser chamado com dados:', {
    name: user.name,
    email: user.email,
    hasPasswordHash: !!user.passwordHash,
    hasSalt: !!user.salt
  });
  console.log('💾 Platform.OS:', Platform.OS);
  console.log('💾 isWeb:', Platform.OS === 'web');
  
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
      
      // Verificação adicional: buscar o usuário recém-inserido
      const insertedUser = webUsers.find(u => u.id === result.lastInsertRowId);
      console.log('🔍 Usuário recém-inserido encontrado:', insertedUser);
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

export const getUserById = (userId: number): User | null => {
  const database = openDatabase();
  
  try {
    const result = database.getFirstSync(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    return result || null;
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
};

export const getUserByEmail = (email: string): User | null => {
  console.log('🔍 getUserByEmail chamado com email:', email);
  console.log('🔍 Platform.OS:', Platform.OS);
  console.log('🔍 isWeb:', Platform.OS === 'web');
  
  const database = openDatabase();
  console.log('🔍 Database obtido:', typeof database);
  console.log('🔍 Database tem getFirstSync?', typeof database.getFirstSync);
  
  // Debug: verificar estado atual do banco web
  if (Platform.OS === 'web') {
    console.log('🌐 Estado atual do banco web:', {
      totalUsers: webUsers.length,
      users: webUsers.map(u => ({ id: u.id, email: u.email, name: u.name }))
    });
    
    // Verificação adicional: buscar diretamente no array
    const directSearch = webUsers.find(u => u.email === email);
    console.log('🔍 Busca direta no array webUsers:', directSearch);
  }
  
  try {
    const result = database.getFirstSync(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    console.log('🔍 Resultado da busca via getFirstSync:', result);
    return result || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

export const updateUser = (userId: number, data: Partial<Pick<User, 'name' | 'email' | 'cpf' | 'phone' | 'riskProfile'>>): void => {
  const database = openDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
  if (data.cpf !== undefined) { fields.push('cpf = ?'); values.push(data.cpf); }
  if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
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

export const updateUserPassword = (userId: number, passwordHash: string, salt: string): void => {
  const database = openDatabase();
  
  try {
    database.runSync(
      `UPDATE users SET passwordHash = ?, salt = ? WHERE id = ?`,
      [passwordHash, salt, userId]
    );
  } catch (error) {
    console.error('Error updating user password:', error);
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
      'INSERT INTO portfolios (userId, assetName, assetType, amount, isDemo, quantity, unitPrice, expectedReturn) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        item.userId,
        item.assetName,
        item.assetType || null,
        item.amount,
        item.isDemo ?? 0,
        item.quantity || null,
        item.unitPrice || null,
        item.expectedReturn || null,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error inserting portfolio item:', error);
    throw error;
  }
};

export const updatePortfolioItem = (id: number, item: Partial<Omit<PortfolioItem, 'id' | 'userId'>>): void => {
  const database = openDatabase();
  
  try {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (item.assetName !== undefined) {
      fields.push('assetName = ?');
      values.push(item.assetName);
    }
    if (item.assetType !== undefined) {
      fields.push('assetType = ?');
      values.push(item.assetType);
    }
    if (item.amount !== undefined) {
      fields.push('amount = ?');
      values.push(item.amount);
    }
    if (item.isDemo !== undefined) {
      fields.push('isDemo = ?');
      values.push(item.isDemo);
    }
    if (item.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(item.quantity);
    }
    if (item.unitPrice !== undefined) {
      fields.push('unitPrice = ?');
      values.push(item.unitPrice);
    }
    if (item.expectedReturn !== undefined) {
      fields.push('expectedReturn = ?');
      values.push(item.expectedReturn);
    }
    
    if (fields.length === 0) {
      return; // Nada para atualizar
    }
    
    values.push(id);
    database.runSync(
      `UPDATE portfolios SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    throw error;
  }
};

export const deletePortfolioItem = (id: number): void => {
  const database = openDatabase();
  
  try {
    database.runSync('DELETE FROM portfolios WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
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

// Chat messages helpers
export const insertChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>): number => {
  const database = openDatabase();
  
  if (Platform.OS === 'web') {
    // Implementação web com localStorage
    const msg = {
      id: nextMessageId++,
      userId: message.userId,
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString()
    };
    webChatMessages.push(msg);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('operum_webChatMessages', JSON.stringify(webChatMessages));
      localStorage.setItem('operum_nextMessageId', nextMessageId.toString());
    }
    
    return msg.id;
  }
  
  try {
    const result = database.runSync(
      'INSERT INTO chat_messages (userId, role, content) VALUES (?, ?, ?)',
      [message.userId, message.role, message.content]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error inserting chat message:', error);
    throw error;
  }
};

export const getChatHistory = (userId: number, limit: number = 10): ChatMessage[] => {
  const database = openDatabase();
  
  if (Platform.OS === 'web') {
    // Implementação web
    const messages = webChatMessages
      .filter(msg => msg.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .reverse();
    return messages;
  }
  
  try {
    const result = database.getAllSync(
      'SELECT * FROM chat_messages WHERE userId = ? ORDER BY timestamp DESC LIMIT ?',
      [userId, limit]
    ) as ChatMessage[];
    return result || [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

export const clearChatHistory = (userId: number): void => {
  const database = openDatabase();
  
  if (Platform.OS === 'web') {
    webChatMessages = webChatMessages.filter(msg => msg.userId !== userId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('operum_webChatMessages', JSON.stringify(webChatMessages));
    }
    return;
  }
  
  try {
    database.runSync(
      'DELETE FROM chat_messages WHERE userId = ?',
      [userId]
    );
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
};
