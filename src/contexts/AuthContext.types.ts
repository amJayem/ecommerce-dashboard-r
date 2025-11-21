import { createContext } from 'react';
import type { User } from '@/lib/api/queries/auth';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  silentRefresh: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

