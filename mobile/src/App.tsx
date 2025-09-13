/**
 * Veridity Mobile App - Complete iOS Application
 * 
 * Main application component that handles authentication and navigation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  AppState,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PushNotification from 'react-native-push-notification';

// Import components
import { MobileAuthScreen } from './src/components/MobileAuth';
import MobileApp from './VeridityMobile';
import { apiClient } from './src/utils/api';

const Stack = createStackNavigator();

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export default function App() {
  const [authState, setAuthState] = useState<AppState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const initializeApp = async () => {
    try {
      // Configure push notifications
      PushNotification.configure({
        onNotification: function(notification) {
          console.log('Notification received:', notification);
          
          if (notification.userInteraction) {
            // User tapped on notification
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
      // App became active, check for updates
      checkForUpdates();
    }
  };

  const checkForUpdates = async () => {
    try {
      // Check for any pending sync operations
      const response = await apiClient.getUserStats();
      if (response.success) {
        // Handle any updates
        console.log('App updated successfully');
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  };

  const handleNotificationTap = (notification: any) => {
    // Handle notification navigation
    if (notification.data?.screen) {
      // Navigate to specific screen based on notification data
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

      // Send welcome notification
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

  const handleLogout = async () => {
    try {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });

      // Clear all notifications
      PushNotification.cancelAllLocalNotifications();
      
      // Send goodbye notification
      PushNotification.localNotification({
        title: 'Signed out securely',
        message: 'Your data remains private and encrypted',
        soundName: 'default',
      });

    } catch (error) {
      console.error('Logout handling failed:', error);
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
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, { animationDelay: '0.1s' }]} />
          <View style={[styles.loadingDot, { animationDelay: '0.2s' }]} />
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
            component={MobileApp}
            options={{
              animationEnabled: true,
              cardStyleInterpolator: ({ current }) => ({
                cardStyle: {
                  opacity: current.progress,
                },
              }),
            }}
          />
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
    // Note: React Native doesn't support CSS animations
    // You would need to use Animated API for animated dots
  },
});