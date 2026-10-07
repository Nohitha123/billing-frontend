import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user_profile');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Auto-login as default Owner for seamless first load preview
        try {
          const res = await api.auth.login({ username: 'owner', password: 'owner123' });
          if (res.data && res.data.user) {
            setUser(res.data.user);
            setToken(res.data.access);
          }
        } catch (err) {
          console.error('Auto login fallback failed:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.auth.login({ username, password });
      const { user: userData, access } = res.data;
      setUser(userData);
      setToken(access);
      localStorage.setItem('access_token', access);
      localStorage.setItem('user_profile', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_profile');
    }
  };

  const isOwner = user?.role === 'OWNER';
  const isWaiter = user?.role === 'WAITER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isOwner,
        isWaiter,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
