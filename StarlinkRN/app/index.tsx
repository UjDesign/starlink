import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

export default function Index() {
    const auth = useContext(AuthContext);

    console.log('🔍 [DEBUG] Root index.tsx - Auth state:', { 
        isAuthenticated: auth?.user !== null, 
        user: auth?.user 
    });

    if (!auth) {
        return <View style={styles.container} />;
    }

    // If user is authenticated, redirect to main app
    if (auth.user) {
        return <Redirect href="/(tabs)" />;
    }

    // Show landing page for unauthenticated users
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Starlink Web3 Platform</Text>
            <Text style={styles.subtitle}>Decentralized Video Sharing</Text>
            
            <Link href="/(auth)/register" asChild>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </Link>
            
            <Link href="/(auth)/login" asChild>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
                    <Text style={[styles.buttonText, styles.secondaryButtonText]}>Sign In</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#a0a0a0',
        marginBottom: 40,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#f39c12',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginBottom: 15,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#f39c12',
    },
    secondaryButtonText: {
        color: '#f39c12',
    },
});
