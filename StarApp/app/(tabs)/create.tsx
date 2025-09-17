import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, ScrollView, SafeAreaView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../.env';
import { FontAwesome } from '@expo/vector-icons';

const CreateScreen: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [isOriginal, setIsOriginal] = useState<boolean>(true);
  const [royaltyFee, setRoyaltyFee] = useState<string>('5');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const auth = useContext(AuthContext);

  // Select video from library
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant permission to access your media library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
    }
  };

  // Upload content as NFT
  const handleUpload = async () => {
    if (!videoUri || !title) {
      Alert.alert('Error', 'Please select a video and enter a title');
      return;
    }

    if (!auth?.user?.userId) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: `video-${Date.now()}.mp4`
      } as any);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', tags);
      formData.append('isOriginal', isOriginal.toString());
      formData.append('royaltyFee', royaltyFee);
      formData.append('userId', auth.user.userId);

      const response = await axios.post(`${API_URL}/upload-content`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Alert.alert('Success', `Content uploaded successfully as NFT! You earned 50 STAR tokens!`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setTags('');
      setVideoUri(null);
      
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.uploadForm}>
        <Text style={styles.title}>Upload Video Content</Text>
        
        <TouchableOpacity 
          style={styles.videoPicker}
          onPress={pickVideo}
        >
          {videoUri ? (
            <Video
              source={{ uri: videoUri }}
              style={styles.previewVideo}
              resizeMode={ResizeMode.COVER}
            />
          ) : (
            <View style={styles.pickerPlaceholder}>
              <FontAwesome name="video-camera" size={40} color="#95a5a6" />
              <Text style={styles.pickerText}>Select Video</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={styles.input}
          placeholder="Tags (comma separated)"
          value={tags}
          onChangeText={setTags}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Original Content</Text>
          <TouchableOpacity
            style={[styles.switch, isOriginal ? styles.switchOn : styles.switchOff]}
            onPress={() => setIsOriginal(!isOriginal)}
          >
            <View style={[styles.switchCircle, isOriginal ? styles.switchCircleOn : styles.switchCircleOff]} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Royalty Fee (%)"
          value={royaltyFee}
          onChangeText={setRoyaltyFee}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload as NFT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  uploadForm: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  videoPicker: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ecf0f1',
    marginBottom: 20,
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  pickerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    marginTop: 10,
    color: '#95a5a6',
    fontSize: 16,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
  },
  switchOff: {
    backgroundColor: '#bdc3c7',
  },
  switchOn: {
    backgroundColor: '#3498db',
  },
  switchCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    marginTop: 2,
  },
  switchCircleOff: {
    marginLeft: 2,
  },
  switchCircleOn: {
    marginLeft: 22,
  },
  uploadButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateScreen;