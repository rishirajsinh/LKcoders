import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getInitials } from '../utils/avatarHelpers';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = isLocal ? 'http://localhost:5000/api' : '/api';

const AuthContext = createContext(null);

const defaultUsers = {
  teacher: { email: 'teacher@eduflow.ai', name: 'Dr. Anita Sharma', role: 'teacher', avatar: 'AS', subject: 'Mathematics' },
  student: { email: 'student@eduflow.ai', name: 'Aarav Mehta', role: 'student', avatar: 'AM', class: '10A', rollNo: 'STU001', studentId: 1 },
  admin: { email: 'admin@eduflow.ai', name: 'Prof. Suresh Kumar', role: 'admin', avatar: 'SK' },
};

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
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const userData = { ...response.data, avatar: getInitials(response.data.name) || 'UD' };
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (error) {
      setLoading(false);
      console.error('Login failed', error.response?.data?.message || error.message);
      throw error;
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'student',
      });
      const userData = { ...response.data, avatar: getInitials(response.data.name) || 'UD' };
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (error) {
      setLoading(false);
      console.error('Registration failed', error.response?.data?.message || error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eduflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
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
