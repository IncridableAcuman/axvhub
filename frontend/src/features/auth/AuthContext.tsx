import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, LoginRequest, RegisterRequest, AuthResponse, VerifyEmailRequest } from '@/types';
import { authApi } from '@/api';

const STORAGE_KEY = 'axm_nexus_user';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'register' | 'login';
  isProfileModalOpen: boolean;
  openAuthModal: (tab?: 'register' | 'login') => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  login: (data: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  verifyEmail: (data: VerifyEmailRequest) => Promise<AuthResponse>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (data: import('@/types').ResetPasswordRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isMentor: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'register' | 'login'>('register');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const openAuthModal = (tab: 'register' | 'login' = 'register') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await authApi.login(data);
    const authData = res.data.data;
    const authUser: AuthUser = {
      id: authData.id,
      username: authData.username,
      email: authData.email,
      fullName: authData.fullName,
      roles: authData.roles,
      permissions: authData.permissions,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      tokenType: authData.tokenType,
      emailVerified: authData.emailVerified,
    };
    setUser(authUser);
    return authData;
  };

  const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await authApi.register(data);
    const authData = res.data.data;
    const authUser: AuthUser = {
      id: authData.id,
      username: authData.username,
      email: authData.email,
      fullName: authData.fullName,
      roles: authData.roles,
      permissions: authData.permissions,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      tokenType: authData.tokenType,
      emailVerified: authData.emailVerified,
    };
    setUser(authUser);
    return authData;
  };

  const verifyEmail = async (data: VerifyEmailRequest): Promise<AuthResponse> => {
    const res = await authApi.verifyEmail(data);
    const authData = res.data.data;
    setUser((prev) =>
      prev
        ? {
            ...prev,
            emailVerified: true,
            accessToken: authData.accessToken || prev.accessToken,
          }
        : null
    );
    return authData;
  };

  const resendVerification = async (email: string): Promise<void> => {
    await authApi.resendVerification({ email });
  };

  const forgotPassword = async (email: string): Promise<string> => {
    const res = await authApi.forgotPassword({ email });
    return res.data.data;
  };

  const resetPassword = async (data: import('@/types').ResetPasswordRequest): Promise<void> => {
    await authApi.resetPassword(data);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const normalizeRole = (r: string) => {
    if (!r) return '';
    const upper = r.trim().toUpperCase();
    return upper.startsWith('ROLE_') ? upper.substring(5) : upper;
  };

  const hasRole = (roleToCheck: string): boolean => {
    if (!user || !user.roles || user.roles.length === 0) return false;
    const target = normalizeRole(roleToCheck);
    return user.roles.some((r) => normalizeRole(r) === target);
  };

  const hasAnyRole = (rolesToCheck: string[]): boolean => {
    return rolesToCheck.some((r) => hasRole(r));
  };

  const hasPermission = (permissionToCheck: string): boolean => {
    if (!user) return false;
    if (hasRole('SUPER_ADMIN') || hasRole('ADMIN')) return true;
    if (!user.permissions || user.permissions.length === 0) return false;
    return user.permissions.some(
      (p) => p.trim().toLowerCase() === permissionToCheck.trim().toLowerCase()
    );
  };

  const isAdmin = hasAnyRole(['SUPER_ADMIN', 'ADMIN', 'PROGRAM_ADMIN']);
  const isMentor = hasAnyRole(['MENTOR', 'ENGLISH_MENTOR']);
  const isStudent = hasRole('STUDENT');

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        isProfileModalOpen,
        openAuthModal,
        closeAuthModal,
        openProfileModal,
        closeProfileModal,
        login,
        register,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        logout,
        hasRole,
        hasAnyRole,
        hasPermission,
        isAdmin,
        isMentor,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useOptionalAuth = (): AuthContextType | null => {
  return useContext(AuthContext) || null;
};
