import {User} from '../../../shared/types';
import {getUserByEmail, getUserByCPF, insertUser, updateUser, deleteUserById} from '../../../core/database/db';

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
    const existing = getUserByEmail(email);
    if (existing) {
      throw new Error('E-mail já cadastrado');
    }

    const salt = String(Date.now());
    const passwordHash = await hashPassword(password, salt);
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
    const userId = insertUser(userData as any);
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
    const isEmail = emailOrCpf.includes('@');
    if (isEmail) {
      const user = getUserByEmail(emailOrCpf);
      if (!user || !user.salt || !user.passwordHash) throw new Error('Credenciais inválidas');
      const h = await hashPassword(password, user.salt);
      if (h !== user.passwordHash) throw new Error('Credenciais inválidas');
      return user;
    }
    const cpf = emailOrCpf.replace(/\D/g, '');
    const user = getUserByCPF(cpf);
    if (!user) throw new Error('Usuário não encontrado');
    return user;
  },

  async update(userId: number, data: Partial<Pick<User, 'name' | 'email' | 'riskProfile'>>): Promise<void> {
    await updateUser(userId, data);
  },

  async delete(userId: number): Promise<void> {
    await deleteUserById(userId);
  },
};
