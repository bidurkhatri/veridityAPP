/**
 * Mobile Authentication Components for Veridity iOS App
 * 
 * Provides native iOS authentication UI connecting to the Veridity backend
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BiometricAuth } from '../components/MobileBiometric';

// Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000' 
  : 'https://veridity.replit.app';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

export function MobileAuthScreen({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    checkStoredCredentials();
  }, []);

  const checkStoredCredentials = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_credentials');
      if (stored) {
        const { email, rememberMe: remember } = JSON.parse(stored);
        if (remember) {
          setFormData(prev => ({ ...prev, email }));
          setRememberMe(true);
          setShowBiometric(true);
        }
      }
    } catch (error) {
      console.error('Failed to load stored credentials:', error);
    }
  };

  const storeCredentials = async (email: string, remember: boolean) => {
    try {
      await AsyncStorage.setItem('user_credentials', JSON.stringify({
        email,
        rememberMe: remember
      }));
    } catch (error) {
      console.error('Failed to store credentials:', error);
    }
  };

  const makeAuthRequest = async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Authentication failed');
    }
    
    return result;
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await makeAuthRequest('email/login', {
        email: formData.email,
        password: formData.password
      });

      // Store credentials if remember me is checked
      if (rememberMe) {
        await storeCredentials(formData.email, true);
      }

      // Store user session
      await AsyncStorage.setItem('user_session', JSON.stringify(result.user));
      
      Alert.alert('Success!', 'Welcome back to Veridity', [
        { text: 'Continue', onPress: () => onAuthSuccess(result.user) }
      ]);

    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await makeAuthRequest('register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Store user session
      await AsyncStorage.setItem('user_session', JSON.stringify(result.user));
      
      Alert.alert('Welcome!', 'Your account has been created successfully', [
        { text: 'Get Started', onPress: () => onAuthSuccess(result.user) }
      ]);

    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      // Biometric authentication successful, proceed with stored credentials
      const stored = await AsyncStorage.getItem('user_credentials');
      if (stored) {
        const { email } = JSON.parse(stored);
        
        // Try to get user session
        const userSession = await AsyncStorage.getItem('user_session');
        if (userSession) {
          const user = JSON.parse(userSession);
          onAuthSuccess(user);
          return;
        }
      }
      
      // If no stored session, show login form
      setShowBiometric(false);
      Alert.alert('Please sign in', 'Enter your password to continue');
    } catch (error) {
      setShowBiometric(false);
      Alert.alert('Authentication failed', 'Please try again');
    }
  };

  const resetAuth = () => {
    setFormData({ email: '', password: '', firstName: '', lastName: '' });
    setRememberMe(false);
    setShowBiometric(false);
  };

  if (showBiometric) {
    return (
      <BiometricAuth
        onSuccess={handleBiometricAuth}
        onError={(error) => {
          console.error('Biometric auth error:', error);
          setShowBiometric(false);
        }}
        onCancel={() => setShowBiometric(false)}
        purpose="proof_generation"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🔐</Text>
            </View>
            <Text style={styles.title}>Veridity</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
            <Text style={styles.description}>
              Privacy-first digital identity platform for Nepal
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                    placeholder="John"
                    autoCapitalize="words"
                    testID="input-first-name"
                  />
                </View>
                <View style={styles.nameInput}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                    placeholder="Doe"
                    autoCapitalize="words"
                    testID="input-last-name"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="input-email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                secureTextEntry
                testID="input-password"
              />
            </View>

            {isLogin && (
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberMeText}>Remember me & enable biometric login</Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={loading}
              testID={isLogin ? "button-login" : "button-register"}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch Mode */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(!isLogin);
                  resetAuth();
                }}
                testID="button-switch-mode"
              >
                <Text style={styles.switchLink}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <Text style={styles.privacyText}>
              🔒 Your data is encrypted and never shared. Zero-knowledge proofs ensure your privacy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 4,
  },
  switchLink: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  privacyNotice: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  privacyText: {
    fontSize: 14,
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 20,
  },
});