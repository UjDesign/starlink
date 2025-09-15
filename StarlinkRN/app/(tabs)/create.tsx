import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { ethers } from 'ethers';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '@env';
// You'll need to get the ABI from your compiled contract
// import ContentNFT from '../../contracts/ContentNFT.json'; 

// const CreateNFT_ADDRESS = process.env.CONTENT_NFT_ADDRESS;

const CreateScreen: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [file] = useState<any>(null); // In a real app, you'd use a file picker
  const [loading, setLoading] = useState<boolean>(false);
  const auth = useContext(AuthContext);

  const createNFT = async () => {
    if (!title || !description || !file) {
      return alert('Please provide all fields');
    }

    setLoading(true);

    // Upload file to IPFS and get the URL (fileUrl)
    // ...

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = provider.getSigner();
      // const contract = new ethers.Contract(CreateNFT_ADDRESS!, ContentNFT.abi, signer);

      // const transaction = await contract.mint(title, description, fileUrl);
      // await transaction.wait();

      // const tokenId = await contract.getTokenId();
      const fileUrl = 'placeholder-url'; // TODO: Implement IPFS upload
      const tokenId = '1'; // TODO: Get actual token ID

      await axios.post(`${API_URL}/api/nfts`, {
        tokenId: tokenId,
        title,
        description,
        ipfsHash: fileUrl,
        owner: await signer.getAddress(),
      }, {
        headers: { Authorization: `Bearer ${auth?.user?.token}` }
      });

      alert('NFT created successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to create NFT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create NFT</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      {/* File picker component here */}
      <Button title="Create NFT" onPress={createNFT} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});

export default CreateScreen;