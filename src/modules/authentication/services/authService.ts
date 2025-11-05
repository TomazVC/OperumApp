import {User} from '../../../shared/types';
import {getUserByEmail, getUserByCPF, insertUser, updateUser, deleteUserById} from '../../../core/database';

// Debug: verificar se as funções foram importadas corretamente
console.log('🔍 authService - Verificando importações:');
console.log('🔍 getUserByEmail:', typeof getUserByEmail);
console.log('🔍 getUserByCPF:', typeof getUserByCPF);
console.log('🔍 insertUser:', typeof insertUser);
console.log('🔍 updateUser:', typeof updateUser);
console.log('🔍 deleteUserById:', typeof deleteUserById);

const hashPassword = async (password: string, salt: string): Promise<string> => {
  const toHash = new TextEncoder().encode(`${password}:${salt}`);
  try {
    // Prefer Web Crypto on web
    const digest = await globalThis.crypto?.subtle?.digest('SHA-256', toHash as ArrayBuffer);
    if (digest) {
      const bytes = Array.from(new Uint8Array(digest));
      return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {}
  // Fallback to expo-crypto on native
  try {
    const Crypto = await import('expo-crypto');
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${password}:${salt}`);
  } catch {
    // As a last resort (should not happen), return plain
    return `${password}:${salt}`;
  }
};

export const authService = {
  async register(name: string, email: string, password: string): Promise<User> {
    console.log('🔐 REGISTRO: Iniciando registro:', { name, email });
    
    const existing = getUserByEmail(email);
    if (existing) {
      console.log('❌ REGISTRO: E-mail já cadastrado:', email);
      throw new Error('E-mail já cadastrado');
    }

    const salt = String(Date.now());
    console.log('🔑 REGISTRO: Gerando hash da senha...', { salt });
    
    const passwordHash = await hashPassword(password, salt);
    console.log('🔑 REGISTRO: Hash gerado:', {
      salt,
      passwordHash: passwordHash.substring(0, 20) + '...',
      passwordLength: password.length
    });
    
    const userData = {
      cpf: `temp_${Date.now()}`,
      name,
      email,
      passwordHash,
      salt,
      riskProfile: null as unknown as string,
      objectives: null as unknown as string,
      firstLogin: 1,
    };
    
    console.log('💾 REGISTRO: Inserindo usuário no banco...');
    const userId = insertUser(userData as any);
    console.log('✅ REGISTRO: ID do usuário criado:', userId);
    
    if (!userId || userId === 0) {
      throw new Error('Falha ao criar usuário');
    }
    
    return {
      id: userId,
      name,
      cpf: userData.cpf,
      email,
      createdAt: new Date().toISOString(),
      firstLogin: 1,
    } as User;
  },

  async login(emailOrCpf: string, password: string): Promise<User> {
    console.log('🔐 LOGIN: Iniciando login:', { emailOrCpf });
    
    const isEmail = emailOrCpf.includes('@');
    if (isEmail) {
      console.log('🔍 LOGIN: Buscando usuário por email...');
      const user = getUserByEmail(emailOrCpf);
      console.log('👤 LOGIN: Usuário encontrado:', user ? 'Sim' : 'Não');
      
      if (user) {
        console.log('👤 LOGIN: Dados do usuário:', {
          id: user.id,
          name: user.name,
          email: user.email,
          hasSalt: !!user.salt,
          hasPasswordHash: !!user.passwordHash,
          salt: user.salt,
          passwordHash: user.passwordHash ? user.passwordHash.substring(0, 20) + '...' : 'null'
        });
      }
      
      if (!user) {
        console.log('❌ LOGIN: Usuário não encontrado');
        throw new Error('Usuário não encontrado');
      }
      
      if (!user.salt || !user.passwordHash) {
        console.log('❌ LOGIN: Usuário inválido - faltando dados de autenticação');
        throw new Error('Credenciais inválidas');
      }
      
      console.log('🔑 LOGIN: Verificando senha...');
      const h = await hashPassword(password, user.salt);
      console.log('🔑 LOGIN: Hash gerado no login:', {
        salt: user.salt,
        generatedHash: h.substring(0, 20) + '...',
        storedHash: user.passwordHash.substring(0, 20) + '...',
        hashesMatch: h === user.passwordHash
      });
      
      if (h !== user.passwordHash) {
        console.log('❌ LOGIN: Hashes não coincidem!');
        throw new Error('Credenciais inválidas');
      }
      
      console.log('✅ LOGIN: Login bem-sucedido');
      return user;
    }
    const cpf = emailOrCpf.replace(/\D/g, '');
    const user = getUserByCPF(cpf);
    if (!user) throw new Error('Usuário não encontrado');
    return user;
  },

  async update(userId: number, data: Partial<Pick<User, 'name' | 'email' | 'cpf' | 'phone' | 'riskProfile'>>): Promise<void> {
    await updateUser(userId, data);
  },

  async updatePassword(userId: number, password: string): Promise<void> {
    const salt = String(Date.now());
    const passwordHash = await hashPassword(password, salt);
    const {updateUserPassword} = await import('../../../core/database');
    await updateUserPassword(userId, passwordHash, salt);
  },

  async delete(userId: number): Promise<void> {
    await deleteUserById(userId);
  },
};
