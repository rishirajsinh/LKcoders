import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = isLocal ? 'http://localhost:5000/api' : '/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eduflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('eduflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('eduflow_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        class: res.data.class || '',
        division: res.data.division || '',
        assignedClass: res.data.assignedClass || '',
        assignedDivision: res.data.assignedDivision || '',
        token: res.data.token,
      };
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(message);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, data);
      const userData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        token: res.data.token,
      };
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Registration failed.';
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eduflow_user');
  };

  // Helper to get auth headers for API requests
  const getAuthHeaders = () => {
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  const refreshUser = async () => {
    if (!user?.token) return;
    try {
      const res = await axios.get(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.data.success) {
        const updatedUser = { ...user, ...res.data.data };
        setUser(updatedUser);
        return updatedUser;
      }
    } catch (err) {
      console.error('REFRESH USER ERROR:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAuthenticated: !!user, getAuthHeaders, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
