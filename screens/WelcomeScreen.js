import { useEffect } from 'react';
import { View,Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons'; 

export default function WelcomeScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#2563EB', '#1E40AF', '#1E3A8A']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconContainer}>
            <Image 
               source={require('../assets/cit-logo.png')} 
               style={styles.logoImage} 
               resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>CIT Transport</Text>
          <Text style={styles.subtitle}>Smart Transportation System</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Feather name="map-pin" size={24} color="#FFFFFF" />
            <Text style={styles.featureText}>Live Notifications</Text>
          </View>
          <View style={styles.feature}>
            <Feather name="users" size={24} color="#FFFFFF" />
            <Text style={styles.featureText}>Multi-User Support</Text>
          </View>
          <View style={styles.feature}>
            <Feather name="navigation" size={24} color="#FFFFFF" />
            <Text style={styles.featureText}>Route Management</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoImage: {
  width: 80,       
  height: 80,
  borderRadius: 10,
},
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuresContainer: {
    marginBottom: 60,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  getStartedText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
});
