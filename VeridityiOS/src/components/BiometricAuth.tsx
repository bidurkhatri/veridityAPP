/**
 * Biometric Authentication Component for iOS
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import TouchID from 'react-native-touch-id';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BiometricAuthProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
  purpose: 'proof_generation' | 'proof_verification' | 'settings_access';
}

export function BiometricAuth({ onSuccess, onError, onCancel, purpose }: BiometricAuthProps) {
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const type = await TouchID.isSupported();
      setBiometricType(type);
      await AsyncStorage.setItem('biometric_type', type);
    } catch (error) {
      console.log('Biometric not supported:', error);
      setBiometricType(null);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!biometricType) {
      onError('Biometric authentication not available');
      return;
    }

    setIsAuthenticating(true);

    try {
      await TouchID.authenticate('Please authenticate to continue', {
        title: 'Biometric Authentication',
        subtitle: 'Use your fingerprint or face to verify identity',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel'
      });
      
      onSuccess();
    } catch (error: any) {
      console.log('Authentication error:', error);
      
      if (error.name === 'LAErrorUserCancel' || error.name === 'UserCancel') {
        onCancel();
      } else {
        onError(error.message || 'Authentication failed');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Checking biometric support...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Biometric Authentication</Text>
        <Text style={styles.subtitle}>Secure access to your identity proofs</Text>
      </View>

      <View style={styles.biometricSection}>
        <View style={styles.biometricIcon}>
          <Text style={styles.biometricEmoji}>
            {biometricType === 'FaceID' ? '👤' : '👆'}
          </Text>
        </View>
        
        <Text style={styles.biometricLabel}>
          {biometricType === 'FaceID' ? 'Face ID' : 'Touch ID'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.authenticateButton}
          onPress={authenticate}
          disabled={isAuthenticating || !biometricType}
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.authenticateButtonText}>
              {biometricType ? `Use ${biometricType === 'FaceID' ? 'Face ID' : 'Touch ID'}` : 'Use PIN/Password'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isAuthenticating}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.privacyNotice}>
        <Text style={styles.privacyText}>
          🔒 Your biometric data never leaves your device and is not stored by Veridity
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  biometricSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  biometricIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  biometricEmoji: {
    fontSize: 40,
  },
  biometricLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  authenticateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  authenticateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  privacyNotice: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  privacyText: {
    fontSize: 12,
    color: '#065F46',
    textAlign: 'center',
  },
});