import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
    // Log login activity
    api.post('write', 'AccessLogs', [{
      timestamp: new Date().toISOString(),
      action: 'LOGIN',
      employeeId: userData.employeeId,
      name: userData.name,
      role: userData.role,
      userAgent: navigator.userAgent
    }]).catch(console.error);
  };

  const logout = () => {
    if (user) {
      // Log logout activity
      api.post('write', 'AccessLogs', [{
        timestamp: new Date().toISOString(),
        action: 'LOGOUT',
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        userAgent: navigator.userAgent
      }]).catch(console.error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
