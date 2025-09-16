// app/index.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import React, { useEffect } from 'react';

export default function HomeScreen() {
  
  // Debug log to confirm component is loaded
  useEffect(() => {
    console.log('HomeScreen mounted successfully');
  }, []);

  const handleGetStarted = () => {
    console.log('Get Started pressed');
    // Navigate to auth flow
    router.push('/(auth)/register'); // Navigate to registration screen
  };

  const handleSignIn = () => {
    console.log('Sign In pressed');
    // Navigate to sign in
    router.push('/(auth)/login'); // Navigate to login screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Starlink Web3 Platform</Text>
      <Text style={styles.subtitle}>Decentralized Video Sharing</Text>
      
      <Pressable 
        style={styles.primaryButton} 
        onPress={handleGetStarted}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </Pressable>
      
      <Pressable 
        style={styles.secondaryButton} 
        onPress={handleSignIn}
      >
        <Text style={styles.secondaryButtonText}>Sign In</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0f0f23',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#b0b0b0',
    marginBottom: 40,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#f39c12',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#f39c12',
    borderWidth: 2,
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#f39c12',
    fontSize: 16,
    fontWeight: 'bold',
  },
});