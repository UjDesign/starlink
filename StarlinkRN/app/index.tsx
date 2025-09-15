import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth();

    console.log('🔍 [DEBUG] Root index.tsx - Auth state:', { isAuthenticated, isLoading });

    if (isLoading) {
        return <View style={styles.container} />;
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
});
