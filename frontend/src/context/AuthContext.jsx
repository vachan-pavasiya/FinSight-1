import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Restore user from /auth/me on page refresh
          const res = await client.get('/auth/me');
          // Response: { success: true, user: { id, name, email, role, createdAt } }
          setUser(res.data.user);
        } catch (error) {
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    // Response: { success: true, data: { user: {...}, accessToken: '...' } }
    const res = await client.post('/auth/login', { email, password });
    const { user: loggedInUser, accessToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
