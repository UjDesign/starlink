import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
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

const HomeScreen: React.FC = () => {
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchNfts = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Nft[]>(`${API_URL}/nfts`, {
          headers: {
            Authorization: `Bearer ${auth?.user?.token}`,
          },
        });
        setNfts(response.data);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.user) {
      fetchNfts();
    }
  }, [auth?.user]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All NFTs</Text>
      <FlatList
        data={nfts}
        renderItem={({ item }) => <NFTCard nft={item} />}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default HomeScreen;