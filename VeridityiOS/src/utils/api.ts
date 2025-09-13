/**
 * API Client for Veridity iOS App
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000' 
  : 'https://veridity.replit.app';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class VeridityApiClient {
  private baseUrl: string;
  private isOnline: boolean = true;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.setupNetworkMonitoring();
  }

  private setupNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected || false;
    });
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      if (!this.isOnline) {
        return {
          success: false,
          error: 'No internet connection. Please check your network and try again.'
        };
      }

      const url = `${this.baseUrl}${endpoint}`;
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network request failed'
      };
    }
  }

  async login(email: string, password: string) {
    return this.makeRequest('/api/auth/email/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getCurrentUser() {
    return this.makeRequest('/api/auth/user');
  }

  async logout() {
    try {
      await this.makeRequest('/api/auth/logout', {
        method: 'POST'
      });
      
      await AsyncStorage.multiRemove([
        'user_session',
        'user_credentials',
        'auth_logs'
      ]);
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateProof(proofType: string, privateInputs: any, publicInputs: any) {
    return this.makeRequest('/api/proofs/generate', {
      method: 'POST',
      body: JSON.stringify({
        proofType,
        privateInputs,
        publicInputs
      })
    });
  }

  async getProofs(userId?: string) {
    const endpoint = userId ? `/api/proofs?userId=${userId}` : '/api/proofs';
    return this.makeRequest(endpoint);
  }

  async getUserStats() {
    return this.makeRequest('/api/user/stats');
  }

  async healthCheck() {
    return this.makeRequest('/api/health');
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const apiClient = new VeridityApiClient();
export default apiClient;