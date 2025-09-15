import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import NFTCard from '../../components/NFTCard';
import { API_URL } from '@env';

interface Nft {
  _id: string;
  title: string;
  description: string;
  ipfsHash: string;
}

export default function HomeScreen() {
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const auth = useContext(AuthContext);

  useEffect(() => {
    console.log('🔍 [DEBUG] (tabs)/index.tsx - Home screen loaded');
    console.log('🔍 [DEBUG] (tabs)/index.tsx - Auth state:', {
      loading: auth?.loading,
      hasUser: !!auth?.user,
      hasToken: !!auth?.user?.token
    });
  }, [auth?.loading, auth?.user]);

  useEffect(() => {
    const fetchNfts = async () => {
      console.log('🔍 [DEBUG] (tabs)/index.tsx - Starting NFT fetch...');
      setLoading(true);
      try {
        console.log('🔍 [DEBUG] (tabs)/index.tsx - Making API request to:', `${API_URL}/nfts`);
        const response = await axios.get<Nft[]>(`${API_URL}/nfts`, {
          headers: {
            Authorization: `Bearer ${auth?.user?.token}`,
          },
        });
        console.log('🔍 [DEBUG] (tabs)/index.tsx - NFT fetch successful, count:', response.data.length);
        setNfts(response.data);
      } catch (error) {
        console.error('🚨 [DEBUG] (tabs)/index.tsx - Error fetching NFTs:', error);
        if (error.response) {
          console.error('🚨 [DEBUG] (tabs)/index.tsx - Response error:', error.response.data);
        }
      } finally {
        setLoading(false);
        console.log('🔍 [DEBUG] (tabs)/index.tsx - NFT fetch completed, loading set to false');
      }
    };

    if (auth?.user) {
      console.log('🔍 [DEBUG] (tabs)/index.tsx - User exists, fetching NFTs');
      fetchNfts();
    } else {
      console.log('❌ [DEBUG] (tabs)/index.tsx - No user, skipping NFT fetch');
      setLoading(false);
    }
  }, [auth?.user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading NFTs...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Starlink NFT Marketplace</Text>
      <Text style={styles.subtitle}>Discover and collect unique NFTs</Text>
      {nfts.length > 0 ? (
        <FlatList
          data={nfts}
          renderItem={({ item }) => <NFTCard nft={item} />}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No NFTs available yet</Text>
          <Text style={styles.emptySubtext}>Check back later or create your first NFT!</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
