import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, User, Tenant, AuthResponse } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nome: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  selectTenant: (tenant: Tenant) => void;
  refreshTenants: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTenants = useCallback(async () => {
    try {
      const userTenants = await api.getTenants();
      setTenants(userTenants);
      
      // Auto-select first tenant if none selected
      const savedTenantId = api.getCurrentTenantId();
      if (savedTenantId) {
        const saved = userTenants.find(t => t.id === savedTenantId);
        if (saved) setCurrentTenant(saved);
      } else if (userTenants.length > 0) {
        setCurrentTenant(userTenants[0]);
        api.setCurrentTenant(userTenants[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (api.isAuthenticated()) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
          await refreshTenants();
        } catch (error) {
          api.clearToken();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [refreshTenants]);

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await api.login({ email, password });
    setUser(response.user);
    await refreshTenants();
  };

  const register = async (nome: string, email: string, password: string) => {
    const response: AuthResponse = await api.register({ nome, email, password });
    setUser(response.user);
    await refreshTenants();
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setCurrentTenant(null);
    setTenants([]);
  };

  const selectTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    api.setCurrentTenant(tenant.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentTenant,
        tenants,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        selectTenant,
        refreshTenants,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
