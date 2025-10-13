import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {User} from '../types';
import {setupDatabase} from '../../core/database';
import {authService} from '../../modules/authentication/services/authService';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = () => {
    try {
      setupDatabase();
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const u = await authService.login(email, password);
      setUser(u);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error; // Re-throw para que a tela possa exibir o erro
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const u = await authService.register(name, email, password);
      setUser(u);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error; // Re-throw para que a tela possa exibir o erro
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, isLoading, signInWithEmail, registerWithEmail, signOut}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};