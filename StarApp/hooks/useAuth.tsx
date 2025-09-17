import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for existing authentication
        const checkAuth = async () => {
            // In a real app, you would check for stored tokens, validate with server, etc.
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);

        // Simulate API call
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                // Simple validation for demo
                if (email && password) {
                    const mockUser = {
                        id: '1',
                        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
                        email,
                    };
                    setUser(mockUser);
                    setIsLoading(false);
                    router.replace('/(tabs)/home');
                    resolve();
                } else {
                    setIsLoading(false);
                    reject(new Error('Invalid credentials'));
                }
            }, 1500);
        });
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);

        // Simulate API call
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (name && email && password) {
                    const mockUser = {
                        id: '1',
                        name,
                        email,
                    };
                    setUser(mockUser);
                    setIsLoading(false);
                    router.replace('/(tabs)/home');
                    resolve();
                } else {
                    setIsLoading(false);
                    reject(new Error('Registration failed'));
                }
            }, 1500);
        });
    };

    const logout = () => {
        setUser(null);
        router.replace('/(auth)/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
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