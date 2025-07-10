import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons'; 

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const activeBuses = [
    { id: 'BUS001', route: 'Route 1', status: 'On Time', location: 'Ennore', capacity: '32/40' },
    { id: 'BUS002', route: 'Route 1', status: 'On Time', location: 'Tondirapet', capacity: '28/40' },
    { id: 'BUS003', route: 'Route 1', status: 'On Time', location: 'Mint', capacity: '35/40' },
  ];

  const recentNotifications = [
    { id: 1, message: 'BUS001 will be delayed by 10 minutes', time: '2 min ago', type: 'warning' },
    { id: 2, message: 'New route added: Route D', time: '1 hour ago', type: 'info' },
    { id: 3, message: 'Maintenance scheduled for BUS002', time: '3 hours ago', type: 'alert' },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#2563EB', '#1E40AF']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hello Everyone!</Text>
          <Text style={styles.welcomeText}>Welcome to College Transport</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Feather name="truck" size={24} color="#FFFFFF" />
              <Text style={styles.statNumber}>75</Text>
              <Text style={styles.statLabel}>Active Buses</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="users" size={24} color="#FFFFFF" />
              <Text style={styles.statNumber}>3500</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="map-pin" size={24} color="#FFFFFF" />
              <Text style={styles.statNumber}>65</Text>
              <Text style={styles.statLabel}>Routes</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Buses</Text>
          {activeBuses.map((bus) => (
            <TouchableOpacity key={bus.id} style={styles.busCard}>
              <View style={styles.busCardHeader}>
                <View style={styles.busInfo}>
                  <Text style={styles.busId}>{bus.id}</Text>
                  <Text style={styles.busRoute}>{bus.route}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    bus.status === 'On Time' ? styles.statusOnTime : styles.statusDelayed,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      bus.status === 'On Time' ? styles.statusTextOnTime : styles.statusTextDelayed,
                    ]}
                  >
                    {bus.status}
                  </Text>
                </View>
              </View>
              <View style={styles.busCardDetails}>
                <View style={styles.busDetail}>
                  <Feather name="map-pin" size={16} color="#6B7280" />
                  <Text style={styles.busDetailText}>{bus.location}</Text>
                </View>
                <View style={styles.busDetail}>
                  <Feather name="users" size={16} color="#6B7280" />
                  <Text style={styles.busDetailText}>{bus.capacity}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          {recentNotifications.map((notification) => (
            <View key={notification.id} style={styles.notificationCard}>
              <View style={styles.notificationIcon}>
                {notification.type === 'warning' && (
                  <Feather name="alert-circle" size={20} color="#F59E0B" />
                )}
                {notification.type === 'info' && (
                  <Feather name="bell" size={20} color="#3B82F6" />
                )}
                {notification.type === 'alert' && (
                  <Feather name="alert-circle" size={20} color="#EF4444" />
                )}
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Feather name="search" size={32} color="#2563EB" />
              <Text style={styles.actionText}>Search Bus</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Feather name="map-pin" size={32} color="#059669" />
              <Text style={styles.actionText}>Live Tracking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Feather name="clock" size={32} color="#DC2626" />
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Feather name="bell" size={32} color="#7C3AED" />
              <Text style={styles.actionText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  busCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  busCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  busInfo: {
    flex: 1,
  },
  busId: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  busRoute: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusOnTime: {
    backgroundColor: '#D1FAE5',
  },
  statusDelayed: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  statusTextOnTime: {
    color: '#059669',
  },
  statusTextDelayed: {
    color: '#DC2626',
  },
  busCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  busDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 6,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  quickActions: {
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginTop: 8,
  },
});
