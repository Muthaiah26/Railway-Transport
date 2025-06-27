import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, Animated, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import io from 'socket.io-client';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const socket = io('https://transport-3d8k.onrender.com');
const ROW_H = 80;
const INTERVAL_MS = 1 * 60 * 1000; // same as backend

export default function RouteDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const [bus, setBus]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveIdx, setLiveIdx] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  
  useEffect(() => {
    navigation.setOptions({ title: 'Live Route' });

    if (params.userType === 'driver') {
    
      fetch('https://transport-3d8k.onrender.com/api/driver/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: params.mobile }),
      })
        .then(r => r.json())
        .then(doc => {
          if (doc.error) return Alert.alert('Login failed', doc.error);
          setBus(doc);
          socket.emit('startTracking', { mobile: params.mobile });
        })
        .catch(e => Alert.alert('Network error', e.message))
        .finally(() => setLoading(false));
    } else {
      
      fetch(`http://transport-3d8k.onrender.com/api/buses/${params.busId}`)
        .then(r => r.json())
        .then(doc => {
          if (doc.error) return Alert.alert('Bus not found', doc.error);
          setBus(doc);
          socket.emit('startTracking', { busId: params.busId });
        })
        .catch(e => Alert.alert('Network error', e.message))
        .finally(() => setLoading(false));
    }
  }, [params]);

  
  useEffect(() => {
    if (!bus) return;
    socket.on('locationUpdate', ({ idx }) => {
      setLiveIdx(idx);
      Animated.timing(anim, {
        toValue: idx * ROW_H,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
    socket.on('trackingError', ({ message }) => {
      Alert.alert('Tracking Error', message);
    });
    return () => {
      socket.off('locationUpdate');
      socket.off('trackingError');
    };
  }, [bus]);

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (!bus)    return <Text style={styles.center}>Unable to load route.</Text>;

  // Render the stops list
  const [h, m] = bus.startTime.split(':').map(Number);
  const start  = new Date(); start.setHours(h, m, 0, 0);
  const formatETA = i =>
    new Date(start.getTime() + i * INTERVAL_MS)
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Route {bus.route} • Started {bus.startTime}
      </Text>
      <View style={styles.trackContainer}>
        <ScrollView>
          <View style={styles.line} />
          <Animated.View
            style={[styles.busIcon, { transform: [{ translateY: anim }] }]}
          >
            <MaterialCommunityIcons name="bus" size={28} color="#fff" />
          </Animated.View>

          {Array.isArray(bus.stops) && bus.stops.map((stop, i) => {
            const passed = i < liveIdx;
            const live   = i === liveIdx;
            return (
              <View key={i} style={styles.stopRow}>
                <View style={[
                  styles.dot,
                  passed && styles.dotPassed,
                  live   && styles.dotLive
                ]}/>
                <View style={styles.info}>
                  <Text style={[
                    styles.stopText,
                    passed && styles.pastText,
                    live   && styles.liveText
                  ]}>
                    {stop}
                  </Text>
                  <Text style={styles.timeText}>
                    Time: {formatETA(i)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:         { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  trackContainer: { flex: 1, position: 'relative', paddingLeft: 24 },
  line:           { position: 'absolute', left: 20, top: 0, bottom: 0, width: 4, backgroundColor: '#CBD5E1' },
  busIcon:        { position: 'absolute', left: 6, width: 32, height: 32, borderRadius: 16,
                    backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  stopRow:        { flexDirection: 'row', alignItems: 'center', height: ROW_H, marginBottom: 8 },
  dot:            { width: 12, height: 12, borderRadius: 6, marginLeft: 14, marginRight: 12,
                    backgroundColor: '#FFF', borderWidth: 2, borderColor: '#CBD5E1' },
  dotPassed:      { backgroundColor: '#CBD5E1', borderColor: '#CBD5E1' },
  dotLive:        { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  info:           { flex: 1 },
  stopText:       { fontSize: 16, color: '#1E293B' },
  pastText:       { color: '#64748B' },
  liveText:       { color: '#22C55E', fontWeight: '600' },
  timeText:       { fontSize: 12, color: '#475569' },
});
