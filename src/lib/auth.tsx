import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiRequest, tokenStore } from './api';
import { isTelegram, telegramInitData } from './telegram';
import type { AuthResponse, AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  telegramLogin: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const handleAuth = (data: AuthResponse) => {
    tokenStore.set(data);
    setUser(data.user);
  };

  // Fetch the full user (incl. firm) for the current session.
  const refreshUser = async () => {
    const me = await apiRequest<AuthUser>('/auth/me', { auth: true });
    setUser(me);
  };

  const telegramLogin = async () => {
    const data = await apiRequest<AuthResponse>('/auth/telegram', {
      method: 'POST',
      body: { initData: telegramInitData() },
    });
    tokenStore.set(data);
    await refreshUser(); // pull firm + latest role
  };

  // On mount: restore an existing session, or auto-login via Telegram initData.
  useEffect(() => {
    (async () => {
      try {
        if (tokenStore.access) {
          await refreshUser();
        } else if (isTelegram()) {
          await telegramLogin();
        }
      } catch {
        tokenStore.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <AuthContext.Provider value={{ user, loading, login, register, telegramLogin, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
