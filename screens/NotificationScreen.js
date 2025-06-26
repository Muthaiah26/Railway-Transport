import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SocketContext } from '../App';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

export default function NotificationScreen({ route }) {
  const socket = useContext(SocketContext);
  const { role } = route.params;

  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState('');

  useEffect(() => {
    
    fetch('http://192.168.122.91:3000/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error(err));

    
    socket.on('studentNotification', async notif => {
      if (role === 'student' || role === 'driver') {
        setNotifications(prev => [notif, ...prev]);

          await Notifications.scheduleNotificationAsync({
          content: {
            title: notif.title || 'New Notification',
            body: notif.message || '',
            sound: true,
          },
          trigger: null,
        });
      }
    });

    return () => {
      socket.off('studentNotification');
    };
  }, [socket, role]);

  const sendNotification = () => {
    if (!newNotification.trim()) {
      Alert.alert('Error', 'Please enter a notification message');
      return;
    }

    const payload = {
      title: 'Announcement',
      message: newNotification,
      sender: 'Transport Incharge',
      type: 'info',
      time: new Date().toISOString(),
    };

    
    socket.emit('sendNotification', payload, response => {
      if (response.success) {
        setNewNotification('');
        Alert.alert('Success', 'Notification sent');
      } else {
        Alert.alert('Error', 'Failed to send');
      }
    });
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
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.unreadCard,
              { borderLeftColor: getNotificationBorder(notification.type) },
            ]}
          >
            <TouchableOpacity
              style={styles.notificationContent}
              onPress={() => {
                // mark as read
                notification.read = true;
                setNotifications([...notifications]);
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
    </View>
  );
}


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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
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
  notificationsList: {
    flex: 1,
    padding: 20,
  },
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
  unreadCard: {
    backgroundColor: '#F0F9FF',
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationMeta: {
    flex: 1,
  },
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
  deleteButton: {
    padding: 4,
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
});
