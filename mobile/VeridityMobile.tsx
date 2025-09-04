/**
 * Veridity Mobile App - React Native Implementation
 * 
 * Cross-platform mobile app for iOS and Android with shared codebase
 * Optimized for Nepal's mobile-first population
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  Vibration,
  BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import PushNotification from 'react-native-push-notification';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import mobile biometric authentication
import TouchID from 'react-native-touch-id';
import FaceID from 'react-native-face-id';

// Shared components from web app (adapted for mobile)
import { offlineService } from '../client/src/lib/offline-first';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Mobile-optimized dashboard
function MobileDashboard({ navigation }: any) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingProofs, setPendingProofs] = useState(0);
  const [userStats, setUserStats] = useState({
    totalProofs: 0,
    verifiedProofs: 0,
    recentProofs: []
  });

  useEffect(() => {
    // Network status monitoring
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected || false);
      if (state.isConnected) {
        syncOfflineData();
      }
    });

    // Load user stats
    loadUserStats();
    
    // Set up periodic sync
    const syncInterval = setInterval(() => {
      if (isOnline) {
        syncOfflineData();
      }
    }, 30000); // Sync every 30 seconds when online

    return () => {
      unsubscribe();
      clearInterval(syncInterval);
    };
  }, []);

  const loadUserStats = async () => {
    try {
      const stats = await AsyncStorage.getItem('userStats');
      if (stats) {
        setUserStats(JSON.parse(stats));
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const syncOfflineData = async () => {
    try {
      const offlineStats = await offlineService.getOfflineStats();
      if (offlineStats) {
        setPendingProofs(offlineStats.proofs.pending);
      }
      
      // Trigger sync
      await offlineService.forceSyncAll();
      
      // Refresh stats
      await loadUserStats();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleGenerateProof = () => {
    Vibration.vibrate(50); // Haptic feedback
    navigation.navigate('ProofGeneration');
  };

  const handleVerifyProof = () => {
    Vibration.vibrate(50);
    navigation.navigate('ProofVerification');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Veridity</Text>
        <View style={styles.networkIndicator}>
          <View style={[
            styles.networkDot, 
            { backgroundColor: isOnline ? '#10B981' : '#EF4444' }
          ]} />
          <Text style={styles.networkText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>स्वागत छ! Welcome!</Text>
          <Text style={styles.welcomeSubtitle}>
            Your privacy-first digital identity platform
          </Text>
          
          {/* Network Status Alert */}
          {!isOnline && (
            <View style={styles.offlineAlert}>
              <Text style={styles.offlineAlertText}>
                📱 Offline Mode: You can still generate proofs!
              </Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.totalProofs}</Text>
            <Text style={styles.statLabel}>Total Proofs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.verifiedProofs}</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingProofs}</Text>
            <Text style={styles.statLabel}>Pending Sync</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleGenerateProof}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>🔐 Generate Proof</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleVerifyProof}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>✅ Verify Proof</Text>
          </TouchableOpacity>
        </View>

        {/* Proof Types */}
        <View style={styles.proofTypesContainer}>
          <Text style={styles.sectionTitle}>Available Verifications</Text>
          
          <TouchableOpacity style={styles.proofTypeCard}>
            <Text style={styles.proofTypeIcon}>🎂</Text>
            <View style={styles.proofTypeInfo}>
              <Text style={styles.proofTypeTitle}>Age Verification</Text>
              <Text style={styles.proofTypeDescription}>
                Prove you're above 18 without revealing your exact age
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.proofTypeCard}>
            <Text style={styles.proofTypeIcon}>🏛️</Text>
            <View style={styles.proofTypeInfo}>
              <Text style={styles.proofTypeTitle}>Citizenship Verification</Text>
              <Text style={styles.proofTypeDescription}>
                Verify Nepali citizenship for government services
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.proofTypeCard}>
            <Text style={styles.proofTypeIcon}>💰</Text>
            <View style={styles.proofTypeInfo}>
              <Text style={styles.proofTypeTitle}>Income Verification</Text>
              <Text style={styles.proofTypeDescription}>
                Prove income eligibility for loans and services
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.proofTypeCard}>
            <Text style={styles.proofTypeIcon}>🎓</Text>
            <View style={styles.proofTypeInfo}>
              <Text style={styles.proofTypeTitle}>Education Verification</Text>
              <Text style={styles.proofTypeDescription}>
                Verify academic qualifications privately
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Mobile proof generation screen
function MobileProofGeneration({ navigation }: any) {
  const [selectedProofType, setSelectedProofType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const biometryType = await TouchID.isSupported();
      setBiometricEnabled(!!biometryType);
    } catch (error) {
      console.log('Biometric not supported:', error);
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (!biometricEnabled) return true;

    try {
      await TouchID.authenticate('Please authenticate to generate proof', {
        title: 'Biometric Authentication',
        subtitle: 'Use your fingerprint or face to verify identity',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel'
      });
      return true;
    } catch (error) {
      Alert.alert('Authentication Failed', 'Please try again');
      return false;
    }
  };

  const generateProof = async () => {
    if (!selectedProofType) {
      Alert.alert('Select Proof Type', 'Please select a proof type first');
      return;
    }

    // Biometric authentication
    const authenticated = await authenticateWithBiometric();
    if (!authenticated) return;

    setIsGenerating(true);
    Vibration.vibrate(100);

    try {
      // Generate proof offline-first
      const proofId = await offlineService.generateProofOffline(
        selectedProofType,
        { /* mock private inputs */ },
        { /* mock public inputs */ }
      );

      // Show success notification
      PushNotification.localNotification({
        title: 'Proof Generated! 🎉',
        message: `Your ${selectedProofType} proof has been generated successfully`,
        soundName: 'default',
        vibrate: true
      });

      Alert.alert(
        'Success!',
        'Your proof has been generated and will sync when you\'re online.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to generate proof. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate Proof</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Select Proof Type</Text>
        
        {['age_verification', 'citizenship_verification', 'income_verification', 'education_verification'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.proofSelectionCard,
              selectedProofType === type && styles.selectedProofCard
            ]}
            onPress={() => setSelectedProofType(type)}
          >
            <Text style={styles.proofSelectionTitle}>
              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            {selectedProofType === type && (
              <Text style={styles.selectedIndicator}>✓ Selected</Text>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.generateButton,
            (!selectedProofType || isGenerating) && styles.disabledButton
          ]}
          onPress={generateProof}
          disabled={!selectedProofType || isGenerating}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? '🔄 Generating...' : '🔐 Generate Proof'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Mobile app navigation
function MobileApp() {
  useEffect(() => {
    // Configure push notifications
    PushNotification.configure({
      onNotification: function(notification) {
        console.log('Notification received:', notification);
      },
      requestPermissions: Platform.OS === 'ios',
    });

    // Handle back button on Android
    const backAction = () => {
      Alert.alert('Hold on!', 'Are you sure you want to exit Veridity?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'YES', onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    return () => backHandler.remove();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        <Stack.Screen name="Dashboard" component={MobileDashboard} />
        <Stack.Screen name="ProofGeneration" component={MobileProofGeneration} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Mobile-optimized styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  networkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  networkText: {
    fontSize: 12,
    color: '#64748B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  offlineAlert: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  offlineAlertText: {
    color: '#92400E',
    fontSize: 14,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  actionsContainer: {
    marginVertical: 16,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginVertical: 16,
  },
  proofTypesContainer: {
    marginBottom: 32,
  },
  proofTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  proofTypeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  proofTypeInfo: {
    flex: 1,
  },
  proofTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  proofTypeDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  proofSelectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedProofCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  proofSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  selectedIndicator: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginTop: 4,
  },
  generateButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MobileApp;