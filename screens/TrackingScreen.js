import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function TrackingScreen() {
  const [selectedBus, setSelectedBus] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const buses = [
    {
      id: 'BUS001',
      route: 'Route A',
      currentLocation: 'Main Gate',
      nextStop: 'Library',
      eta: '5 min',
      speed: '25 km/h',
      passengers: 32,
      coordinates: { latitude: 12.9716, longitude: 77.5946 },
      status: 'Moving'
    },
    {
      id: 'BUS002',
      route: 'Route B',
      currentLocation: 'Sports Complex',
      nextStop: 'Engineering Block',
      eta: '8 min',
      speed: '0 km/h',
      passengers: 28,
      coordinates: { latitude: 12.9756, longitude: 77.5986 },
      status: 'Stopped'
    },
    {
      id: 'BUS003',
      route: 'Route C',
      currentLocation: 'Central Plaza',
      nextStop: 'Main Gate',
      eta: '12 min',
      speed: '30 km/h',
      passengers: 35,
      coordinates: { latitude: 12.9696, longitude: 77.5906 },
      status: 'Moving'
    },
  ];

  const startTracking = (busId) => {
    setSelectedBus(busId);
    setIsTracking(true);
    Alert.alert('Tracking Started', `Now tracking ${busId} live location`);
  };

  const stopTracking = () => {
    setSelectedBus(null);
    setIsTracking(false);
    Alert.alert('Tracking Stopped', 'Live tracking has been stopped');
  };

  const refreshLocation = () => {
    setLastUpdated(new Date());
    Alert.alert('Location Updated', 'Bus locations have been refreshed');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTracking) {
        setLastUpdated(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isTracking]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Bus Tracking</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshLocation}>
          <Feather name="refresh-cw" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Feather name="map-pin" size={48} color="#6B7280" />
          <Text style={styles.mapText}>Interactive Map</Text>
          <Text style={styles.mapSubtext}>
            {selectedBus ? `Tracking ${selectedBus}` : 'Select a bus to track'}
          </Text>
        </View>

        {selectedBus && (
          <View style={styles.trackingInfo}>
            <View style={styles.trackingHeader}>
              <Text style={styles.trackingTitle}>Currently Tracking</Text>
              <TouchableOpacity onPress={stopTracking}>
                <Text style={styles.stopButton}>Stop</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.trackingBus}>{selectedBus}</Text>
            <Text style={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.busListContainer}>
        <Text style={styles.busListTitle}>Available Buses</Text>
        {buses.map((bus) => (
          <TouchableOpacity
            key={bus.id}
            style={[
              styles.busCard,
              selectedBus === bus.id && styles.selectedBusCard
            ]}
            onPress={() => selectedBus === bus.id ? stopTracking() : startTracking(bus.id)}
          >
            <View style={styles.busCardHeader}>
              <View style={styles.busInfo}>
                <Text style={styles.busId}>{bus.id}</Text>
                <Text style={styles.busRoute}>{bus.route}</Text>
              </View>
              <View style={[
                styles.statusIndicator,
                bus.status === 'Moving' ? styles.statusMoving : styles.statusStopped
              ]}>
                <Text style={styles.statusText}>{bus.status}</Text>
              </View>
            </View>

            <View style={styles.busDetails}>
              <View style={styles.detailRow}>
                <Feather name="map-pin" size={16} color="#6B7280" />
                <Text style={styles.detailText}>At: {bus.currentLocation}</Text>
              </View>
              <View style={styles.detailRow}>
                <Feather name="navigation" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Next: {bus.nextStop}</Text>
              </View>
              <View style={styles.detailRow}>
                <Feather name="clock" size={16} color="#6B7280" />
                <Text style={styles.detailText}>ETA: {bus.eta}</Text>
              </View>
            </View>

            <View style={styles.busStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bus.speed}</Text>
                <Text style={styles.statLabel}>Speed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bus.passengers}/40</Text>
                <Text style={styles.statLabel}>Passengers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bus.eta}</Text>
                <Text style={styles.statLabel}>ETA</Text>
              </View>
            </View>

            <View style={styles.trackButton}>
              <Text style={styles.trackButtonText}>
                {selectedBus === bus.id ? 'Stop Tracking' : 'Track Bus'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
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
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  mapContainer: {
    height: height * 0.3,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 12,
  },
  mapSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  trackingInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    borderRadius: 12,
    padding: 12,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  stopButton: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  trackingBus: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  busListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  busListTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  busCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedBusCard: {
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: '#F0F9FF',
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
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  busRoute: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusMoving: {
    backgroundColor: '#D1FAE5',
  },
  statusStopped: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
  },
  busDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 8,
  },
  busStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  trackButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  trackButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
