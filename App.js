import React, { useEffect, createContext, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import TrackingScreen from './screens/TrackingScreen';
import NotificationScreen from './screens/NotificationScreen';
import ProfileScreen from './screens/ProfileScreen';
import RouteDetailScreen from './screens/RouteDetailScreen';



export const SocketContext = createContext(null);

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

function TabNavigator({route}) {
  const insets = useSafeAreaInsets();
  const { role } = route.params; 
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{
          title: 'Track',
          tabBarIcon: ({ size, color }) => (
            <Feather name="map-pin" size={size} color={color} />
          ),
        }}
      />
       <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        initialParams={{ role }}                
        options={{
          tabBarIcon: ({ size, color }) => (
            <Feather name="bell" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  
  const socket = io('https://transport-3d8k.onrender.com', {
    transports: ['websocket'],
  });

  useEffect(() => {
    registerForPushNotificationsAsync();

    
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Foreground Notification:', notification);
    });

    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User tapped notification:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);


  
  
  if (!fontsLoaded && !fontError) {
    return null;
  }



  return (
    <SafeAreaProvider>
      <SocketContext.Provider value={socket}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Main" component={TabNavigator} />
             <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ headerShown: true, headerBackTitle: 'Back', title: 'Route Detail' }} />
          </Stack.Navigator>
          <Toast />
        </NavigationContainer>
      </SocketContext.Provider>
    </SafeAreaProvider>
  );
}

async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Permission for notifications not granted!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}
