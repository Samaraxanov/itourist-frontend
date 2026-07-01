import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiRequest, tokenStore } from './api';
import type { AuthResponse, AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterInput {
  email: string;
  password: string;
  asFirm?: boolean;
  firmName?: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, if we hold tokens, restore the session via /me.
  useEffect(() => {
    if (!tokenStore.access) {
      setLoading(false);
      return;
    }
    apiRequest<AuthUser>('/auth/me', { auth: true })
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = (data: AuthResponse) => {
    tokenStore.set(data);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    handleAuth(await apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }));
  };

  const register = async (input: RegisterInput) => {
    handleAuth(await apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: input }));
  };

  const logout = async () => {
    try {
      if (tokenStore.refresh) {
        await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken: tokenStore.refresh } });
      }
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
