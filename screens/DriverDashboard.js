import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SocketContext } from '../App';

export default function DriverDashboard({ route }) {
  const { driverId, busNo } = route.params;
  const socket = useContext(SocketContext);

  const startBus = () => {
    socket.emit('busStarted', { driverId, busNo }, response => {
      if (response.success) {
        Alert.alert('Success', `Bus ${busNo} started.`);
      } else {
        Alert.alert('Error', 'Could not start bus.');
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Driver ID: {driverId}</Text>
      <Text style={styles.label}>Bus Number: {busNo}</Text>
      <TouchableOpacity style={styles.button} onPress={startBus}>
        <Text style={styles.buttonText}>Start Bus</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  label: { fontSize:18, marginBottom:12 },
  button: { backgroundColor:'#10B981', padding:14, borderRadius:8 },
  buttonText: { color:'#fff', fontSize:16 }
});

