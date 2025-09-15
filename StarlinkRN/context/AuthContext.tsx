import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setUser({ token });
        router.replace('/(tabs)/home');
      }
      setLoading(false);
    };

    checkToken();
  }, []);

  const login = async (token: string) => {
    await AsyncStorage.setItem('token', token);
    setUser({ token });
    router.replace('/(tabs)/home');
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};