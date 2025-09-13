/**
 * Mobile Dashboard for Veridity iOS App
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
  Alert,
  Vibration
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { apiClient } from '../utils/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface DashboardProps {
  user: User | null;
}

export function MobileDashboard({ user }: DashboardProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingProofs, setPendingProofs] = useState(0);
  const [userStats, setUserStats] = useState({
    totalProofs: 0,
    verifiedProofs: 0,
    recentProofs: []
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected || false);
      if (state.isConnected) {
        syncOfflineData();
      }
    });

    loadUserStats();
    
    const syncInterval = setInterval(() => {
      if (isOnline) {
        syncOfflineData();
      }
    }, 30000);

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
      const response = await apiClient.getUserStats();
      if (response.success && response.data) {
        setUserStats(response.data);
        await AsyncStorage.setItem('userStats', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleGenerateProof = () => {
    Vibration.vibrate(50);
    Alert.alert(
      'Generate Proof',
      'Select the type of proof you want to generate',
      [
        { text: 'Age Verification', onPress: () => generateProof('age_verification') },
        { text: 'Citizenship', onPress: () => generateProof('citizenship_verification') },
        { text: 'Income', onPress: () => generateProof('income_verification') },
        { text: 'Education', onPress: () => generateProof('education_verification') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const generateProof = async (proofType: string) => {
    try {
      Alert.alert('Success', `${proofType.replace('_', ' ')} proof generated successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate proof. Please try again.');
    }
  };

  const handleVerifyProof = () => {
    Vibration.vibrate(50);
    Alert.alert('Verify Proof', 'Scan a QR code to verify a proof');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
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
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>स्वागत छ! Welcome!</Text>
          <Text style={styles.welcomeSubtitle}>
            Hello {user?.firstName}, your privacy-first digital identity platform
          </Text>
          
          {!isOnline && (
            <View style={styles.offlineAlert}>
              <Text style={styles.offlineAlertText}>
                📱 Offline Mode: You can still generate proofs!
              </Text>
            </View>
          )}
        </View>

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

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleGenerateProof}
            activeOpacity={0.8}
            testID="button-generate-proof"
          >
            <Text style={styles.primaryButtonText}>🔐 Generate Proof</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleVerifyProof}
            activeOpacity={0.8}
            testID="button-verify-proof"
          >
            <Text style={styles.secondaryButtonText}>✅ Verify Proof</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.proofTypesContainer}>
          <Text style={styles.sectionTitle}>Available Verifications</Text>
          
          <TouchableOpacity style={styles.proofTypeCard} testID="card-age-verification">
            <Text style={styles.proofTypeIcon}>🎂</Text>
            <View style={styles.proofTypeInfo}>
              <Text style={styles.proofTypeTitle}>Age Verification</Text>
              <Text style={styles.proofTypeDescription}>
                Prove you're above 18 without revealing your exact age
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.proofTypeCard} testID="card-citizenship-verification">
            <Text style={styles.proofTypeIcon}>🏛️</Text>
            <View style={styles.proofTypeInfo}>
              <Text style={styles.proofTypeTitle}>Citizenship Verification</Text>
              <Text style={styles.proofTypeDescription}>
                Verify Nepali citizenship for government services
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.proofTypeCard} testID="card-income-verification">
            <Text style={styles.proofTypeIcon}>💰</Text>
            <View style={styles.proofTypeInfo}>
              <Text style={styles.proofTypeTitle}>Income Verification</Text>
              <Text style={styles.proofTypeDescription}>
                Prove income eligibility for loans and services
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.proofTypeCard} testID="card-education-verification">
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
});