import * as SQLite from 'expo-sqlite';

const DB_NAME = 'operum.db';
let db: SQLite.SQLiteDatabase | null = null;

export const openDatabase = (): SQLite.SQLiteDatabase => {
  if (db) return db;
  db = SQLite.openDatabaseSync(DB_NAME);
  return db;
};

export const setupDatabase = (): void => {
  const database = openDatabase();
  database.transaction(tx => {
    // users: add auth fields and firstLogin flag
    tx.executeSql(`
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
    tx.executeSql(`
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
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT,
        updatedAt INTEGER
      );
    `);

    // answers for risk questionnaire
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS user_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        questionId TEXT,
        answer TEXT,
        score INTEGER,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  });
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
  const database = openDatabase();
  let insertId: number = 0;
  
  database.transaction(tx => {
    tx.executeSql(
      'INSERT INTO users (cpf, name, email, passwordHash, salt, riskProfile, objectives, firstLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user.cpf || null, user.name, user.email || null, user.passwordHash || null, user.salt || null, user.riskProfile || null, user.objectives || null, user.firstLogin ?? 1],
      (_, result) => {
        insertId = result.insertId;
      },
      (_, error) => {
        console.error('Error inserting user:', error);
        return false;
      }
    );
  });
  
  return insertId;
};

export const getUserByCPF = (cpf: string): User | null => {
  const database = openDatabase();
  let user: User | null = null;
  
  database.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM users WHERE cpf = ?',
      [cpf],
      (_, result) => {
        if (result.rows.length > 0) {
          user = result.rows.item(0);
        }
      },
      (_, error) => {
        console.error('Error getting user by CPF:', error);
        return false;
      }
    );
  });
  
  return user;
};

export const getUserByEmail = (email: string): User | null => {
  const database = openDatabase();
  let user: User | null = null;
  database.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (_, result) => {
        if (result.rows.length > 0) {
          user = result.rows.item(0);
        }
      },
      (_, error) => {
        console.error('Error getting user by email:', error);
        return false;
      }
    );
  });
  return user;
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
  database.transaction(tx => {
    tx.executeSql(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  });
};

export const deleteUserById = (userId: number): void => {
  const database = openDatabase();
  database.transaction(tx => {
    tx.executeSql('DELETE FROM portfolios WHERE userId = ?', [userId]);
    tx.executeSql('DELETE FROM user_answers WHERE userId = ?', [userId]);
    tx.executeSql('DELETE FROM users WHERE id = ?', [userId]);
  });
};

export const listPortfolioByUserId = (userId: number): PortfolioItem[] => {
  const database = openDatabase();
  const items: PortfolioItem[] = [];
  
  database.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM portfolios WHERE userId = ?',
      [userId],
      (_, result) => {
        for (let i = 0; i < result.rows.length; i++) {
          items.push(result.rows.item(i));
        }
      },
      (_, error) => {
        console.error('Error listing portfolio:', error);
        return false;
      }
    );
  });
  
  return items;
};

export const insertPortfolioItem = (item: Omit<PortfolioItem, 'id'>): number => {
  const database = openDatabase();
  let insertId: number = 0;
  
  database.transaction(tx => {
    tx.executeSql(
      'INSERT INTO portfolios (userId, assetName, assetType, amount, isDemo) VALUES (?, ?, ?, ?, ?)',
      [item.userId, item.assetName, item.assetType || null, item.amount, item.isDemo ?? 0],
      (_, result) => {
        insertId = result.insertId;
      },
      (_, error) => {
        console.error('Error inserting portfolio item:', error);
        return false;
      }
    );
  });
  
  return insertId;
};

// Persistent cache helpers
export const getCache = (key: string): {value: string; updatedAt: number} | null => {
  const database = openDatabase();
  let row: {value: string; updatedAt: number} | null = null;
  database.transaction(tx => {
    tx.executeSql(
      'SELECT value, updatedAt FROM cache WHERE key = ? LIMIT 1',
      [key],
      (_, result) => {
        if (result.rows.length > 0) {
          row = result.rows.item(0);
        }
      },
      () => false
    );
  });
  return row;
};

export const setCache = (key: string, value: string, updatedAt: number): void => {
  const database = openDatabase();
  database.transaction(tx => {
    tx.executeSql(
      'REPLACE INTO cache (key, value, updatedAt) VALUES (?, ?, ?)',
      [key, value, updatedAt]
    );
  });
};
