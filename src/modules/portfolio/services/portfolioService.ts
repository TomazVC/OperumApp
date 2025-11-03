import {PortfolioItem} from '../../../shared/types';
import {listPortfolioByUserId, insertPortfolioItem, updatePortfolioItem as updatePortfolioItemDb, deletePortfolioItem} from '../../../core/database/db';

export const portfolioService = {
  getUserPortfolio(userId: number): PortfolioItem[] {
    try {
      return listPortfolioByUserId(userId);
    } catch (error) {
      console.error('Erro ao buscar portfólio:', error);
      throw error;
    }
  },

  addPortfolioItem(item: Omit<PortfolioItem, 'id'>): number {
    try {
      return insertPortfolioItem(item);
    } catch (error) {
      console.error('Erro ao adicionar item ao portfólio:', error);
      throw error;
    }
  },

  updatePortfolioItem(id: number, item: Partial<Omit<PortfolioItem, 'id' | 'userId'>>): void {
    try {
      updatePortfolioItemDb(id, item);
    } catch (error) {
      console.error('Erro ao atualizar item do portfólio:', error);
      throw error;
    }
  },

  removePortfolioItem(id: number): void {
    try {
      deletePortfolioItem(id);
    } catch (error) {
      console.error('Erro ao remover item do portfólio:', error);
      throw error;
    }
  },

  createDefaultPortfolio(userId: number): void {
    // keep but reduced amounts to zero for new accounts
    const defaultItems: Omit<PortfolioItem, 'id'>[] = [];
    for (const item of defaultItems) {
      insertPortfolioItem(item);
    }
  },
};
