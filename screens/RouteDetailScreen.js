import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RouteDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>🚧 Work is under process 🚧</Text>
    </View>
  );
};

export default RouteDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  message: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    textAlign: 'center',
    padding: 20,
  },
});
