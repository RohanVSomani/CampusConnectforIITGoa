/**
 * Auth context - user, login, logout, token
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { resetSocketManager } from '@/lib/socketManager';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('campusflow_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await api.get('/auth/me');
      setUser(u);
    } catch {
      localStorage.removeItem('campusflow_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.post('/auth/login', { email, password });
    localStorage.setItem('campusflow_token', token);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (email, password, name, role, coords) => {
    const payload = { email, password, name };
  
    if (role) payload.role = role;
  
    if (coords?.lat && coords?.lng) {
      payload.lat = coords.lat;
      payload.lng = coords.lng;
    }
  
    const { token, user: u } = await api.post('/auth/register', payload);
  
    localStorage.setItem('campusflow_token', token);
    setUser(u);
    return u;
  }, []);
  
  
  

  const logout = useCallback(() => {
    localStorage.removeItem('campusflow_token');
    resetSocketManager(); // 🔥 drop old auth
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => loadUser(), [loadUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
