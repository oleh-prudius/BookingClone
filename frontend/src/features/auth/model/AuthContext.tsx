import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage, refreshTokenStorage, userStorage } from '@shared/lib/tokenStorage';
import type { User } from '@shared/types';
import { userApi } from '@entities/user';
import { authApi } from '../api/authApi';
import type { LoginDto, RegisterDto, UpdateProfileDto } from '../api/authApi';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<string>;
  updateProfile: (dto: UpdateProfileDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => userStorage.get());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = tokenStorage.get();
    if (token) {
      setLoading(true);
      userApi.me()
        .then((u) => {
          setUser(u);
          userStorage.set(u);
        })
        .catch(() => {
          tokenStorage.clear();
          setUser(null);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      navigate('/login');
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyAuthResponse = (data: { token: string; refreshToken: string; user: User }) => {
    tokenStorage.set(data.token);
    refreshTokenStorage.set(data.refreshToken);
    userStorage.set(data.user);
    setUser(data.user);
  };

  const login = async (dto: LoginDto) => {
    const data = await authApi.login(dto);
    applyAuthResponse(data);
  };

  const register = async (dto: RegisterDto): Promise<string> => {
    return await authApi.register(dto);
  };

  const updateProfile = async (dto: UpdateProfileDto) => {
    const updatedUser = await authApi.updateProfile(dto);
    userStorage.set(updatedUser);
    setUser(updatedUser);
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, loading, login, register, updateProfile, logout }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
