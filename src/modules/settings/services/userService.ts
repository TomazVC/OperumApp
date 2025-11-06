import {authService} from '../../authentication/services/authService';
import {User} from '../../../shared/types';

export const userService = {
  async updateUser(userId: number, data: Partial<Pick<User, 'name' | 'email' | 'cpf' | 'phone'>>): Promise<void> {
    await authService.update(userId, data);
  },

  async updatePassword(userId: number, password: string): Promise<void> {
    await authService.updatePassword(userId, password);
  },

  async deleteAccount(userId: number): Promise<void> {
    await authService.delete(userId);
  },
};



