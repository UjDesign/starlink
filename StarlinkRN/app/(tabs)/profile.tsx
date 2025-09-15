import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import NFTCard from '../../components/NFTCard';
import { API_URL } from '@env';

interface Nft {
  _id: string;
  title: string;
  description: string;
  ipfsHash: string;
}

const ProfileScreen: React.FC = () => {
  const auth = useContext(AuthContext);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserNfts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/nfts/user`, {
          headers: { Authorization: `Bearer ${auth?.user?.token}` }
        });
        setNfts(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.user) {
      fetchUserNfts();
    }
  }, [auth?.user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Button title="Logout" onPress={() => auth?.logout()} />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={nfts}
          renderItem={({ item }) => <NFTCard nft={item} />}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default ProfileScreen;