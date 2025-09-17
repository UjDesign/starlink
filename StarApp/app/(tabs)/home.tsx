import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../.env';
import { FontAwesome } from '@expo/vector-icons';

interface Content {
  _id: string;
  title: string;
  description: string;
  ipfsHash: string;
  creator: {
    walletAddress: string;
  };
  likes: number;
  tags: string[];
  createdAt: string;
}

// Video Card Component
const VideoCard = ({ item, onLike, onReport, userId }: { 
  item: Content; 
  onLike: (contentId: string, userId: string) => void;
  onReport: (contentId: string, userId: string) => void;
  userId: string;
}) => {
  return (
    <View style={styles.videoCard}>
      <Video
        source={{ uri: `http://localhost:8080/ipfs/${item.ipfsHash}` }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        isLooping={false}
        useNativeControls
      />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{item.title}</Text>
        <Text style={styles.videoCreator}>
          Creator: {item.creator.walletAddress.substring(0, 6)}...
        </Text>
        <Text style={styles.videoDescription}>{item.description}</Text>
        <View style={styles.videoActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onLike(item._id, userId)}
          >
            <FontAwesome name="thumbs-up" size={20} color="#3498db" />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onReport(item._id, userId)}
          >
            <FontAwesome name="flag" size={20} color="#e74c3c" />
            <Text style={styles.actionText}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="share-alt" size={20} color="#2ecc71" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const auth = useContext(AuthContext);

  // Fetch content list
  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/content?page=${page}&limit=10`);
      if (page === 1) {
        setContents(response.data.contents);
      } else {
        setContents([...contents, ...response.data.contents]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contents:', error);
      setLoading(false);
    }
  };

  // Handle like content
  const handleLike = async (contentId: string, userId: string) => {
    try {
      const response = await axios.post(`${API_URL}/like-content`, {
        contentId,
        userId
      });
      
      // Update local state
      setContents(contents.map(content => 
        content._id === contentId 
          ? { ...content, likes: response.data.likes } 
          : content
      ));
      
      Alert.alert('Success', `You earned 10 STAR tokens! New balance: ${response.data.starBalance}`);
    } catch (error) {
      console.error('Error liking content:', error);
      Alert.alert('Error', 'Failed to like content');
    }
  };

  // Handle report content
  const handleReport = async (contentId: string, userId: string) => {
    Alert.prompt(
      'Report Content',
      'Please specify the reason for reporting:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: async (reason) => {
            if (!reason) return;
            
            try {
              await axios.post(`${API_URL}/report-content`, {
                contentId,
                userId,
                reason,
                evidence: ''
              });
              
              Alert.alert('Success', 'Content reported successfully');
              
              // Remove from list
              setContents(contents.filter(content => content._id !== contentId));
            } catch (error) {
              console.error('Error reporting content:', error);
              Alert.alert('Error', 'Failed to report content');
            }
          }
        }
      ],
      'plain-text',
      'Copyright infringement, harassment, etc.'
    );
  };

  // Load more content
  const loadMore = () => {
    setPage(page + 1);
  };

  useEffect(() => {
    fetchContents();
  }, [page]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading NFTs...</Text>
      </SafeAreaView>
    );
  }

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Starlink</Text>
        <Text style={styles.subtitle}>Web3 Video Platform</Text>
        {auth?.user?.starBalance !== undefined && (
          <View style={styles.balanceContainer}>
            <FontAwesome name="star" size={16} color="#f39c12" />
            <Text style={styles.balanceText}>{auth.user.starBalance} STAR</Text>
          </View>
        )}
      </View>
      
      {contents.length > 0 ? (
        <FlatList
          data={contents}
          renderItem={({ item }) => (
            <VideoCard 
              item={item} 
              onLike={handleLike} 
              onReport={handleReport}
              userId={auth?.user?.userId || ''}
            />
          )}
          keyExtractor={(item) => item._id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator size="large" color="#3498db" /> : null}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome name="video-camera" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No videos available yet</Text>
          <Text style={styles.emptySubtext}>Be the first to upload and earn STAR tokens!</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 8,
    borderRadius: 20,
    gap: 5,
  },
  balanceText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoCard: {
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  video: {
    width: '100%',
    height: 300,
  },
  videoInfo: {
    padding: 15,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  videoCreator: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  videoActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
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
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
