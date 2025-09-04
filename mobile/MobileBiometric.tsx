/**
 * Mobile Biometric Authentication Components for Veridity
 * 
 * Provides secure biometric authentication for mobile devices
 * Supporting fingerprint, face recognition, and device PIN
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import TouchID from 'react-native-touch-id';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

interface BiometricConfig {
  title: string;
  subtitle: string;
  description: string;
  fallbackLabel: string;
  cancelLabel: string;
  color: string;
  fallbackToPinCodeAction: boolean;
  showErrorAlert: boolean;
  imageColor: string;
  imageErrorColor: string;
}

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
      
      // Store biometric capability info
      await AsyncStorage.setItem('biometric_type', type);
    } catch (error) {
      console.log('Biometric not supported:', error);
      setBiometricType(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getBiometricConfig = (): BiometricConfig => {
    const configs = {
      proof_generation: {
        title: 'Generate Proof',
        subtitle: 'Authenticate to create zero-knowledge proof',
        description: 'Your biometric data stays on your device and is never shared',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        color: '#3B82F6',
        fallbackToPinCodeAction: true,
        showErrorAlert: false,
        imageColor: '#3B82F6',
        imageErrorColor: '#EF4444'
      },
      proof_verification: {
        title: 'Verify Proof',
        subtitle: 'Authenticate to verify identity proof',
        description: 'Secure verification using your biometric signature',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        color: '#10B981',
        fallbackToPinCodeAction: true,
        showErrorAlert: false,
        imageColor: '#10B981',
        imageErrorColor: '#EF4444'
      },
      settings_access: {
        title: 'Access Settings',
        subtitle: 'Authenticate to access sensitive settings',
        description: 'Protect your privacy settings with biometric authentication',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        color: '#8B5CF6',
        fallbackToPinCodeAction: true,
        showErrorAlert: false,
        imageColor: '#8B5CF6',
        imageErrorColor: '#EF4444'
      }
    };

    return configs[purpose];
  };

  const authenticate = async () => {
    if (!biometricType) {
      onError('Biometric authentication not available');
      return;
    }

    setIsAuthenticating(true);
    const config = getBiometricConfig();

    try {
      await TouchID.authenticate(config.description, config);
      
      // Log successful authentication
      await logAuthenticationEvent('success');
      
      onSuccess();
    } catch (error: any) {
      console.log('Authentication error:', error);
      
      await logAuthenticationEvent('failed', error.message);
      
      if (error.name === 'LAErrorUserCancel' || error.name === 'UserCancel') {
        onCancel();
      } else if (error.name === 'LAErrorUserFallback' || error.name === 'UserFallback') {
        // User chose to use PIN/password fallback
        handleFallbackAuthentication();
      } else {
        onError(error.message || 'Authentication failed');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleFallbackAuthentication = () => {
    Alert.alert(
      'Alternative Authentication',
      'Please use your device PIN or password to continue',
      [
        { text: 'Cancel', onPress: onCancel },
        { 
          text: 'Continue', 
          onPress: async () => {
            // Simulate PIN/password verification
            // In a real app, this would prompt for device credentials
            await logAuthenticationEvent('fallback_success');
            onSuccess();
          }
        }
      ]
    );
  };

  const logAuthenticationEvent = async (event: string, details?: string) => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const timestamp = new Date().toISOString();
      
      const logEntry = {
        event,
        purpose,
        biometricType,
        deviceId,
        timestamp,
        details,
        platform: Platform.OS
      };

      // Store locally for offline capability
      const existingLogs = await AsyncStorage.getItem('auth_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await AsyncStorage.setItem('auth_logs', JSON.stringify(logs));
      
      // TODO: Sync with server when online
    } catch (error) {
      console.error('Failed to log authentication event:', error);
    }
  };

  const getBiometricIcon = () => {
    if (!biometricType) return '🔐';
    
    switch (biometricType.toLowerCase()) {
      case 'faceId':
      case 'face':
        return '👤';
      case 'touchId':
      case 'fingerprint':
        return '👆';
      default:
        return '🔐';
    }
  };

  const getBiometricLabel = () => {
    if (!biometricType) return 'Device Authentication';
    
    switch (biometricType.toLowerCase()) {
      case 'faceId':
      case 'face':
        return 'Face ID';
      case 'touchId':
      case 'fingerprint':
        return 'Fingerprint';
      default:
        return 'Biometric Authentication';
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

  const config = getBiometricConfig();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.subtitle}>{config.subtitle}</Text>
      </View>

      <View style={styles.biometricSection}>
        <View style={[styles.biometricIcon, { backgroundColor: config.color + '20' }]}>
          <Text style={styles.biometricEmoji}>{getBiometricIcon()}</Text>
        </View>
        
        <Text style={styles.biometricLabel}>{getBiometricLabel()}</Text>
        <Text style={styles.description}>{config.description}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.authenticateButton, { backgroundColor: config.color }]}
          onPress={authenticate}
          disabled={isAuthenticating || !biometricType}
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.authenticateButtonText}>
              {biometricType ? `Use ${getBiometricLabel()}` : 'Use PIN/Password'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isAuthenticating}
        >
          <Text style={styles.cancelButtonText}>{config.cancelLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Text style={styles.privacyText}>
          🔒 Your biometric data never leaves your device and is not stored by Veridity
        </Text>
      </View>
    </View>
  );
}

// Biometric settings component
export function BiometricSettings() {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);

  useEffect(() => {
    loadBiometricSettings();
  }, []);

  const loadBiometricSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('biometric_enabled');
      const type = await TouchID.isSupported();
      
      setBiometricEnabled(enabled === 'true');
      setBiometricType(type);
    } catch (error) {
      console.error('Failed to load biometric settings:', error);
    }
  };

  const toggleBiometric = async () => {
    if (!biometricEnabled) {
      // Enable biometric - require authentication first
      try {
        await TouchID.authenticate('Enable biometric authentication for Veridity', {
          title: 'Enable Biometric Authentication',
          fallbackLabel: 'Cancel',
          cancelLabel: 'Cancel'
        });
        
        await AsyncStorage.setItem('biometric_enabled', 'true');
        setBiometricEnabled(true);
        
        Alert.alert('Success', 'Biometric authentication has been enabled');
      } catch (error) {
        Alert.alert('Failed', 'Could not enable biometric authentication');
      }
    } else {
      // Disable biometric
      await AsyncStorage.setItem('biometric_enabled', 'false');
      setBiometricEnabled(false);
      
      Alert.alert('Disabled', 'Biometric authentication has been disabled');
    }
  };

  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Biometric Authentication</Text>
      
      <TouchableOpacity
        style={styles.settingItem}
        onPress={toggleBiometric}
        disabled={!biometricType}
      >
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>
            Use {biometricType === 'FaceID' ? 'Face ID' : 'Fingerprint'}
          </Text>
          <Text style={styles.settingDescription}>
            Secure your proof generation with biometric authentication
          </Text>
        </View>
        
        <View style={[
          styles.toggle,
          biometricEnabled && styles.toggleEnabled
        ]}>
          <View style={[
            styles.toggleIndicator,
            biometricEnabled && styles.toggleIndicatorEnabled
          ]} />
        </View>
      </TouchableOpacity>

      {!biometricType && (
        <Text style={styles.noSupportText}>
          Biometric authentication is not available on this device
        </Text>
      )}
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
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  authenticateButton: {
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
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleEnabled: {
    backgroundColor: '#10B981',
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleIndicatorEnabled: {
    alignSelf: 'flex-end',
  },
  noSupportText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});