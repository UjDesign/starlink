import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: { token: string } | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      console.log('🔍 [DEBUG] AuthContext - Starting token check...');
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('🔍 [DEBUG] AuthContext - Retrieved token:', token ? 'EXISTS' : 'NULL');
        if (token) {
          setUser({ token });
          console.log('✅ [DEBUG] AuthContext - User set with token');
        } else {
          console.log('❌ [DEBUG] AuthContext - No token found');
        }
      } catch (error) {
        console.error('🚨 [DEBUG] AuthContext - Error checking token:', error);
      } finally {
        setLoading(false);
        console.log('🔍 [DEBUG] AuthContext - Token check completed, loading set to false');
      }
    };

    checkToken();
  }, []);

  const login = async (token: string) => {
    console.log('🔍 [DEBUG] AuthContext - Login called with token');
    try {
      await AsyncStorage.setItem('token', token);
      setUser({ token });
      console.log('✅ [DEBUG] AuthContext - Login successful, user set');
    } catch (error) {
      console.error('🚨 [DEBUG] AuthContext - Login error:', error);
    }
  };

  const logout = async () => {
    console.log('🔍 [DEBUG] AuthContext - Logout called');
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
      console.log('✅ [DEBUG] AuthContext - Logout successful, user cleared');
    } catch (error) {
      console.error('🚨 [DEBUG] AuthContext - Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};