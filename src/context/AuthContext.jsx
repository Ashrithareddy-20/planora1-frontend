import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('planora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('planora_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.getCurrentUser()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('planora_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, id, name, role } = res.data;
    const userData = { id, name, email, role };
    setToken(token);
    setUser(userData);
    localStorage.setItem('planora_token', token);
    localStorage.setItem('planora_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    const { token, id, name, email, role } = res.data;
    const userData = { id, name, email, role };
    setToken(token);
    setUser(userData);
    localStorage.setItem('planora_token', token);
    localStorage.setItem('planora_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('planora_token');
    localStorage.removeItem('planora_user');
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('planora_user', JSON.stringify(updated));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ROLE_ADMIN',
    isVendor: user?.role === 'ROLE_VENDOR' || user?.role === 'ROLE_ADMIN',
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
