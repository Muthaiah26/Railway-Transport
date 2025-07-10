import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SocketContext } from '../App';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import ImageView from 'react-native-image-viewing';

export default function NotificationScreen({ route }) {
  const socket = useContext(SocketContext);
  const { role } = route.params;

  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); 
  const [imageViewerUri, setImageViewerUri] = useState(null); 
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const HOST = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'      
  : 'http://192.168.59.91:3000';
 
  useEffect(() => {

    
    fetchNotifications();

    socket.on('studentNotification', async notif => {
      if (role === 'student' || role === 'driver') {
        setNotifications(prev => [notif, ...prev]);

         const imageUri = notif.imageUrl
      ? `http://192.168.59.91:3000${notif.imageUrl}`
      : undefined;

        await Notifications.scheduleNotificationAsync({
      content: {
        title: notif.title || 'New Notification',
        body: notif.message || (imageUri ? '📷 Tap to view image' : ''),
        sound: true,
        data: { imageUri },         
      },
          trigger: null,
        });
      }
    });

    return () => {
      socket.off('studentNotification');
    };
  }, [socket, role]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const imageUri = response.notification.request.content.data.imageUri;
      console.log('Tapped notification data:', response.notification.request.content.data);

      if (imageUri) {
        setImageViewerUri(imageUri);
        setImageViewerVisible(true);
      }
    });

    return () => subscription.remove();
  }, []);
 

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://192.168.59.91:3000/api/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const sendNotification = async () => {
    if (!newNotification.trim() && !selectedImage) {
      Alert.alert('Error', 'Please enter a message or select an image');
      return;
    }

    const formData = new FormData();
    formData.append('title', 'Announcement');
    formData.append('message', newNotification);
    formData.append('sender', 'Transport Incharge');
    formData.append('type', 'info');

    if (selectedImage) {
      formData.append('image', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: 'notification.jpg',
      });
    }

    try {
      const res = await fetch('http://192.168.59.91:3000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setNewNotification('');
        setSelectedImage(null);
        fetchNotifications();
        Alert.alert('Success', 'Notification sent');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notifications</Text>
          {notifications.filter(n => !n.read).length > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {notifications.filter(n => !n.read).length}
              </Text>
            </View>
          )}
        </View>
        <Feather name="bell" size={24} color="#2563EB" />
      </View>

      {role === 'incharge' && (
        <View style={styles.sendSection}>
          <Text style={styles.sendTitle}>Send Notification</Text>
          <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
              <Feather name="image" size={16} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.uploadText}>
              {selectedImage ? 'Change Selected Image' : 'Upload Image'}
             </Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage.uri }}
              style={{ width: 100, height: 100, marginBottom: 10, borderRadius: 8 }}
            />
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={newNotification}
              onChangeText={setNewNotification}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendNotification}
            >
              <Feather name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.notificationsList}>
        {notifications.map(notification => (
          <View
            key={notification._id || notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.unreadCard,
              { borderLeftColor: getNotificationBorder(notification.type) },
            ]}
          >
            <TouchableOpacity
              style={styles.notificationContent}
              onPress={() => {
                if (notification.imageUrl) {
      const uri = `${HOST}${notification.imageUrl}`;
      console.log('🖼 Opening image viewer at:', uri);
      setImageViewerUri(uri);
      setImageViewerVisible(true);
    } else {
      notification.read = true;
      setNotifications([...notifications]);
    }
  }}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </View>
                <View style={styles.notificationMeta}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationSender}>
                    From: {notification.sender}
                  </Text>
                </View>
              </View>

              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>

              {notification.imageUrl && (
                  <TouchableOpacity
    onPress={() => {
      setImageViewerUri(`http://192.168.59.91:3000${notification.imageUrl}`);
      setImageViewerVisible(true);
    }}
  >
    <Image
      source={{ uri: `http://192.168.59.91:3000${notification.imageUrl}` }}
      style={{ width: '100%', height: 200, borderRadius: 10, marginTop: 10 }}
      resizeMode="cover"
    />
  </TouchableOpacity>
              )}

              <View style={styles.notificationFooter}>
                <Text style={styles.notificationTime}>
                  {new Date(notification.time).toLocaleString()}
                </Text>
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      {notifications.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="bell" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyMessage}>
            You're all caught up! New notifications will appear here.
          </Text>
        </View>
      )}

      {/* 🔍 Full-screen image viewer */}
      <ImageView
        images={ imageViewerUri ? [{ uri: imageViewerUri }] : [] }
        imageIndex={0}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </View>
  );
}

// Utilities
function getNotificationIcon(type) {
  switch (type) {
    case 'warning':
      return <Feather name="alert-triangle" size={20} color="#F59E0B" />;
    case 'alert':
      return <Feather name="alert-circle" size={20} color="#EF4444" />;
    case 'success':
      return <Feather name="check-circle" size={20} color="#10B981" />;
    default:
      return <Feather name="info" size={20} color="#3B82F6" />;
  }
}

function getNotificationBorder(type) {
  switch (type) {
    case 'warning':
      return '#F59E0B';
    case 'alert':
      return '#EF4444';
    case 'success':
      return '#10B981';
    default:
      return '#3B82F6';
  }
}

// Styles (unchanged, as yours are already good)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#1F2937' },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 12,
  },
  unreadCount: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  sendSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sendTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end' },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 12,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationsList: { flex: 1, padding: 20 },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  unreadCard: { backgroundColor: '#F0F9FF' },
  notificationContent: { padding: 16 },
  notificationHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  notificationIcon: { marginRight: 12, marginTop: 2 },
  notificationMeta: { flex: 1 },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  notificationSender: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  uploadButton: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  paddingVertical: 6,
  paddingHorizontal: 12,
  backgroundColor: '#E0ECFF',
  borderRadius: 8,
  marginBottom: 10,
},
uploadText: {
  color: '#2563EB',
  fontSize: 14,
  fontFamily: 'Inter-SemiBold',
},
});
