import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user info if token exists on mount
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data);
      } catch (err) {
        console.error('Session load failed:', err.customMessage || err.message);
        logout(); // clear invalid token
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        address: data.address,
      });
      return data;
    } catch (err) {
      const errMsg = err.customMessage || 'Login failed';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone, address) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', {
        name,
        email,
        password,
        phone,
        address,
      });
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        address: data.address,
      });
      return data;
    } catch (err) {
      const errMsg = err.customMessage || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.put('/api/auth/profile', profileData);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        address: data.address,
      });
      return data;
    } catch (err) {
      const errMsg = err.customMessage || 'Update profile failed';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
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
