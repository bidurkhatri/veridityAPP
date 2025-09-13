/**
 * Veridity iOS App - Main Application
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  AppState as RNAppState,
  Platform,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PushNotification from 'react-native-push-notification';

// Import components
import { MobileAuthScreen } from './src/components/MobileAuth';
import { MobileDashboard } from './src/screens/MobileDashboard';
import { apiClient } from './src/utils/api';

const Stack = createStackNavigator();

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  // Animated values for loading dots
  const dot1 = new Animated.Value(0);
  const dot2 = new Animated.Value(0);
  const dot3 = new Animated.Value(0);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Handle app state changes
    const subscription = RNAppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (authState.isLoading) {
      startLoadingAnimation();
    }
  }, [authState.isLoading]);

  const startLoadingAnimation = () => {
    const createDotAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createDotAnimation(dot1, 0),
      createDotAnimation(dot2, 200),
      createDotAnimation(dot3, 400),
    ]).start();
  };

  const initializeApp = async () => {
    try {
      // Configure push notifications
      PushNotification.configure({
        onNotification: function(notification) {
          console.log('Notification received:', notification);
          
          if (notification.userInteraction) {
            handleNotificationTap(notification);
          }
        },
        requestPermissions: Platform.OS === 'ios',
      });

      // Check for existing user session
      await checkExistingSession();
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert('Error', 'Failed to initialize application');
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const checkExistingSession = async () => {
    try {
      const userSession = await AsyncStorage.getItem('user_session');
      
      if (userSession) {
        const user = JSON.parse(userSession);
        
        // Verify session with server
        const response = await apiClient.getCurrentUser();
        
        if (response.success && response.data) {
          setAuthState({
            isAuthenticated: true,
            user: response.data,
            isLoading: false
          });
          
          // Send welcome back notification
          PushNotification.localNotification({
            title: 'Welcome back! 👋',
            message: `Hello ${user.firstName}, your proofs are ready to use`,
            soundName: 'default',
          });
          
          return;
        } else {
          // Session invalid, clear storage
          await AsyncStorage.removeItem('user_session');
        }
      }
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });

    } catch (error) {
      console.error('Session check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
    }
  };

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active' && authState.isAuthenticated) {
      checkForUpdates();
    }
  };

  const checkForUpdates = async () => {
    try {
      const response = await apiClient.getUserStats();
      if (response.success) {
        console.log('App updated successfully');
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  };

  const handleNotificationTap = (notification: any) => {
    if (notification.data?.screen) {
      console.log('Navigate to:', notification.data.screen);
    }
  };

  const handleAuthSuccess = async (user: User) => {
    try {
      setAuthState({
        isAuthenticated: true,
        user: user,
        isLoading: false
      });

      PushNotification.localNotification({
        title: 'Welcome to Veridity! 🎉',
        message: `Hi ${user.firstName}! Your privacy-first identity platform is ready`,
        soundName: 'default',
        vibrate: true,
      });

    } catch (error) {
      console.error('Auth success handling failed:', error);
    }
  };

  // Loading screen
  if (authState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🔐</Text>
        </View>
        <Text style={styles.loadingTitle}>Veridity</Text>
        <Text style={styles.loadingSubtitle}>Securing your digital identity...</Text>
        
        <View style={styles.loadingIndicator}>
          <Animated.View style={[styles.loadingDot, { opacity: dot1 }]} />
          <Animated.View style={[styles.loadingDot, { opacity: dot2 }]} />
          <Animated.View style={[styles.loadingDot, { opacity: dot3 }]} />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F8FAFC" 
        translucent={false}
      />
      
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: true 
        }}
      >
        {authState.isAuthenticated ? (
          <Stack.Screen 
            name="Main" 
            options={{
              animationEnabled: true,
              cardStyleInterpolator: ({ current }) => ({
                cardStyle: {
                  opacity: current.progress,
                },
              }),
            }}
          >
            {() => <MobileDashboard user={authState.user} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen 
            name="Auth"
            options={{
              animationEnabled: true,
              cardStyleInterpolator: ({ current }) => ({
                cardStyle: {
                  opacity: current.progress,
                },
              }),
            }}
          >
            {() => <MobileAuthScreen onAuthSuccess={handleAuthSuccess} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  logoText: {
    fontSize: 50,
    color: '#FFFFFF',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 40,
  },
  loadingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginHorizontal: 4,
  },
});