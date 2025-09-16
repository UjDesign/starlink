import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  FlatList, Image, SafeAreaView, ScrollView, 
  Alert, ActivityIndicator, KeyboardAvoidingView 
} from 'react-native';
import { Video } from 'expo-av';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';

// API配置
const API_URL = 'http://localhost:5000/api';

// 组件：视频卡片
const VideoCard = ({ item, onLike, onReport, userId }) => {
  return (
    <View style={styles.videoCard}>
      <Video
        source={{ uri: `http://localhost:8080/ipfs/${item.ipfsHash}` }}
        style={styles.video}
        resizeMode="cover"
        controls
        repeat={false}
      />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{item.title}</Text>
        <Text style={styles.videoCreator}>
          Creator: {item.creator.walletAddress.substring(0, 6)}...
        </Text>
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

// 屏幕：首页
const HomeScreen = ({ route, navigation }) => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { userId, starBalance } = route.params || { userId: null, starBalance: 0 };

  // 获取内容列表
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

  // 点赞内容
  const handleLike = async (contentId, userId) => {
    try {
      const response = await axios.post(`${API_URL}/like-content`, {
        contentId,
        userId
      });
      
      // 更新本地状态
      setContents(contents.map(content => 
        content._id === contentId 
          ? { ...content, likes: response.data.likes } 
          : content
      ));
      
      // 更新导航栏的STAR余额
      navigation.setParams({ 
        starBalance: response.data.starBalance 
      });
    } catch (error) {
      console.error('Error liking content:', error);
      Alert.alert('Error', 'Failed to like content');
    }
  };

  // 举报内容
  const handleReport = async (contentId, userId) => {
    try {
      const reason = await new Promise((resolve) => {
        Alert.prompt(
          'Report Content',
          'Please specify the reason for reporting:',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
            { text: 'Submit', onPress: (text) => resolve(text) }
          ],
          'plain-text',
          'Copyright infringement, harassment, etc.'
        );
      });
      
      if (!reason) return;
      
      await axios.post(`${API_URL}/report-content`, {
        contentId,
        userId,
        reason,
        evidence: ''
      });
      
      Alert.alert('Success', 'Content reported successfully');
      
      // 从列表中移除已举报内容
      setContents(contents.filter(content => content._id !== contentId));
    } catch (error) {
      console.error('Error reporting content:', error);
      Alert.alert('Error', 'Failed to report content');
    }
  };

  // 加载更多
  const loadMore = () => {
    setPage(page + 1);
  };

  useEffect(() => {
    fetchContents();
  }, [page]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={contents}
        renderItem={({ item }) => (
          <VideoCard 
            item={item} 
            onLike={handleLike} 
            onReport={handleReport}
            userId={userId}
          />
        )}
        keyExtractor={item => item._id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
      />
    </SafeAreaView>
  );
};

// 屏幕：上传
const UploadScreen = ({ route, navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isOriginal, setIsOriginal] = useState(true);
  const [royaltyFee, setRoyaltyFee] = useState('5');
  const [videoUri, setVideoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userId } = route.params || { userId: null };

  // 选择视频
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

    if (!result.canceled) {
      setVideoUri(result.uri);
    }
  };

  // 上传内容
  const handleUpload = async () => {
    if (!videoUri || !title) {
      Alert.alert('Error', 'Please select a video and enter a title');
      return;
    }

    try {
      setLoading(true);
      
      // 准备表单数据
      const formData = new FormData();
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: `video-${Date.now()}.mp4`
      });
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', tags);
      formData.append('isOriginal', isOriginal.toString());
      formData.append('royaltyFee', royaltyFee);
      formData.append('userId', userId);

      const response = await axios.post(`${API_URL}/upload-content`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Alert.alert('Success', 'Content uploaded successfully as NFT!');
      
      // 重置表单
      setTitle('');
      setDescription('');
      setTags('');
      setVideoUri(null);
      
      // 更新STAR余额
      navigation.setParams({ 
        starBalance: response.data.starBalance 
      });
      
      // 返回首页
      navigation.navigate('Home');
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
        <TouchableOpacity 
          style={styles.videoPicker}
          onPress={pickVideo}
        >
          {videoUri ? (
            <Video
              source={{ uri: videoUri }}
              style={styles.previewVideo}
              resizeMode="cover"
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

// 屏幕：个人资料
const ProfileScreen = ({ route }) => {
  const { userId, starBalance } = route.params || { userId: null, starBalance: 0 };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarPlaceholder}>
          <FontAwesome name="user" size={40} color="#ecf0f1" />
        </View>
        <Text style={styles.starBalance}>
          Balance: {starBalance} STAR
        </Text>
      </View>
      
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>My Content NFTs</Text>
        <View style={styles.emptyState}>
          <FontAwesome name="image" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>You haven't created any content yet</Text>
        </View>
      </View>
      
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Staked Content</Text>
        <View style={styles.emptyState}>
          <FontAwesome name="thumbs-up" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>You haven't staked any content yet</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// 屏幕：登录/注册
const AuthScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/register`, {
        phoneNumber
      });

      // 导航到首页并传递用户信息
      navigation.navigate('Main', {
        screen: 'Home',
        params: {
          userId: response.data.userId,
          walletAddress: response.data.walletAddress,
          starBalance: response.data.starBalance
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authCard}>
        <FontAwesome name="star" size={60} color="#f39c12" style={styles.logo} />
        <Text style={styles.appName}>StarLink</Text>
        <Text style={styles.authSubtitle}>Web3短视频内容平台</Text>

        <TextInput
          style={styles.authInput}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.authButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.authButtonText}>Sign Up / Log In</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.authFooter}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

// 创建底部导航
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const [starBalance, setStarBalance] = useState(0);

  // 更新STAR余额
  const updateStarBalance = (newBalance) => {
    setStarBalance(newBalance);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Upload') {
            iconName = focused ? 'plus-circle' : 'plus-circle';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'user' : 'user';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f39c12',
        tabBarInactiveTintColor: '#7f8c8d',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <View style={styles.headerBalance}>
            <FontAwesome name="star" size={16} color="#f39c12" />
            <Text style={styles.balanceText}>{starBalance}</Text>
          </View>
        ),
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        listeners={({ navigation, route }) => ({
          focus: () => navigation.setParams({ starBalance }),
        })}
      />
      <Tab.Screen 
        name="Upload" 
        component={UploadScreen}
        listeners={({ navigation }) => ({
          focus: () => navigation.setParams({ starBalance }),
        })}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// 创建堆栈导航
const Stack = createStackNavigator();

// 主应用组件
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  },
  videoCreator: {
    fontSize: 14,
    color: '#7f8c8d',
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
  },
  uploadForm: {
    padding: 20,
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
  profileHeader: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2980b9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  starBalance: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 5,
    borderRadius: 4,
  },
  profileSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    marginTop: 15,
    color: '#95a5a6',
    fontSize: 16,
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  authCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e',
  },
  authSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  authInput: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    marginBottom: 20,
    fontSize: 16,
  },
  authButton: {
    backgroundColor: '#f39c12',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authFooter: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
  },
  headerBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    gap: 5,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
    