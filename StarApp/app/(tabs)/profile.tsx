import React, { useContext, useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, Alert 
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import NFTCard from '../../components/NFTCard';
import { API_URL } from '../../.env';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

interface Content {
  _id: string;
  title: string;
  description: string;
  ipfsHash: string;
  creator: {
    walletAddress: string;
  };
  likes: number;
  reports: number;
  createdAt: string;
}

function ProfileScreen() {
  const auth = useContext(AuthContext);
  const [userContent, setUserContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalLikes: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (auth?.user?.userId) {
      fetchUserContent();
    }
  }, [auth?.user?.userId]);

  const fetchUserContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/content?creator=${auth?.user?.userId}`);
      const content = response.data.content || [];
      setUserContent(content);
      
      // Calculate stats
      const totalLikes = content.reduce((sum: number, item: Content) => sum + item.likes, 0);
      setStats({
        totalVideos: content.length,
        totalLikes,
        totalViews: content.length * 10 // Mock view count
      });
    } catch (error) {
      console.error('Error fetching user content:', error);
      Alert.alert('Error', 'Failed to load your content');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => auth?.logout(), style: 'destructive' }
      ]
    );
  };

  if (!auth?.user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loginPrompt}>Please log in to view your profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <FontAwesome name="user-circle" size={60} color="#3498db" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.walletAddress}>
            {auth.user.walletAddress?.substring(0, 6)}...{auth.user.walletAddress?.substring(-4)}
          </Text>
          <View style={styles.balanceContainer}>
            <FontAwesome name="star" size={16} color="#f39c12" />
            <Text style={styles.starBalance}>{auth.user.starBalance || 0} STAR</Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalVideos}</Text>
          <Text style={styles.statLabel}>Videos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalLikes}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalViews}</Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>My Videos ({userContent.length})</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
      ) : userContent.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome name="video-camera" size={50} color="#bdc3c7" />
          <Text style={styles.emptyText}>No videos yet</Text>
          <Text style={styles.emptySubtext}>Start creating content to see it here!</Text>
        </View>
      ) : (
        <FlatList
          data={userContent}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.contentItem}>
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.contentDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.contentStats}>
                  <View style={styles.contentStat}>
                    <FontAwesome name="thumbs-up" size={14} color="#3498db" />
                    <Text style={styles.contentStatText}>{item.likes}</Text>
                  </View>
                  <Text style={styles.contentDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.contentList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loginPrompt: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logoutButton: {
    padding: 10,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  walletAddress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starBalance: {
    fontSize: 14,
    color: '#f39c12',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  loader: {
    marginTop: 50,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 15,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 5,
    textAlign: 'center',
  },
  contentList: {
    paddingBottom: 20,
  },
  contentItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  contentDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
    lineHeight: 20,
  },
  contentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentStatText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#3498db',
  },
  contentDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default ProfileScreen;