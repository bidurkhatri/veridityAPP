/**
 * Biometric Authentication Component
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import TouchID from 'react-native-touch-id';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BiometricAuthProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
  purpose: 'login' | 'proof_generation' | 'settings_access';
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

  const getConfig = () => {
    const configs = {
      login: {
        title: 'Sign In to Veridity',
        subtitle: 'Use biometric authentication to sign in',
        description: 'Please authenticate to access your digital identity',
        color: '#3B82F6'
      },
      proof_generation: {
        title: 'Generate Proof',
        subtitle: 'Authenticate to create zero-knowledge proof',
        description: 'Your biometric data stays on your device and is never shared',
        color: '#10B981'
      },
      settings_access: {
        title: 'Access Settings',
        subtitle: 'Authenticate to access sensitive settings',
        description: 'Protect your privacy settings with biometric authentication',
        color: '#8B5CF6'
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
    const config = getConfig();

    try {
      await TouchID.authenticate(config.description, {
        title: config.title,
        subtitle: config.subtitle,
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        color: config.color,
        fallbackToPinCodeAction: true,
        showErrorAlert: false,
        imageColor: config.color,
        imageErrorColor: '#EF4444'
      });
      
      onSuccess();
    } catch (error: any) {
      console.log('Authentication error:', error);
      
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
          onPress: () => {
            // In a real app, this would prompt for device credentials
            onSuccess();
          }
        }
      ]
    );
  };

  const getBiometricIcon = () => {
    if (!biometricType) return '🔐';
    
    switch (biometricType.toLowerCase()) {
      case 'faceid':
      case 'face':
        return '👤';
      case 'touchid':
      case 'fingerprint':
        return '👆';
      default:
        return '🔐';
    }
  };

  const getBiometricLabel = () => {
    if (!biometricType) return 'Device Authentication';
    
    switch (biometricType.toLowerCase()) {
      case 'faceid':
      case 'face':
        return 'Face ID';
      case 'touchid':
      case 'fingerprint':
        return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
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

  const config = getConfig();

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
          testID="button-authenticate"
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
          testID="button-cancel"
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
    textAlign: 'center',
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
    paddingHorizontal: 20,
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
});