import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, SafeAreaView 
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../.env';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

const RegisterScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const auth = useContext(AuthContext);

  const handleRegister = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/register`, {
        phoneNumber
      });

      // Login user with received data
      await auth?.login(
        'dummy-token', // Backend doesn't return token yet, using placeholder
        response.data.userId,
        response.data.walletAddress,
        response.data.starBalance
      );

      Alert.alert(
        'Welcome to Starlink!', 
        `Account created successfully!\n\nWallet: ${response.data.walletAddress.substring(0, 10)}...\nSTAR Balance: ${response.data.starBalance}`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.status === 400) {
        Alert.alert('Info', 'User already exists. Logging you in...');
        // For existing users, we'd need to implement login logic
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Error', 'Failed to register. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authCard}>
        <FontAwesome name="star" size={60} color="#f39c12" style={styles.logo} />
        <Text style={styles.appName}>StarLink</Text>
        <Text style={styles.subtitle}>Web3 Video Platform</Text>
        <Text style={styles.description}>
          Create videos, mint NFTs, and earn STAR tokens!
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholderTextColor="#95a5a6"
        />

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.registerButtonText}>Sign Up / Log In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.features}>
          <View style={styles.feature}>
            <FontAwesome name="gift" size={20} color="#f39c12" />
            <Text style={styles.featureText}>100 STAR welcome bonus</Text>
          </View>
          <View style={styles.feature}>
            <FontAwesome name="video-camera" size={20} color="#3498db" />
            <Text style={styles.featureText}>50 STAR per video upload</Text>
          </View>
          <View style={styles.feature}>
            <FontAwesome name="heart" size={20} color="#e74c3c" />
            <Text style={styles.featureText}>10 STAR per like given</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  authCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#34495e',
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  registerButton: {
    backgroundColor: '#f39c12',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 25,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  features: {
    width: '100%',
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#34495e',
  },
  footer: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default RegisterScreen;