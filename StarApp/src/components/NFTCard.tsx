import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface Nft {
  _id: string;
  title: string;
  description: string;
  ipfsHash: string;
}

interface NFTCardProps {
  nft: Nft;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: `https://ipfs.io/ipfs/${nft.ipfsHash}` }} style={styles.image} />
      <Text style={styles.title}>{nft.title}</Text>
      <Text style={styles.description}>{nft.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 1,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default NFTCard;