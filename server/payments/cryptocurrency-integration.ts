/**
 * Cryptocurrency Payment Integration
 * Global payment accessibility through digital currencies
 */

export interface CryptoCurrency {
  symbol: string;
  name: string;
  network: string;
  decimals: number;
  contractAddress?: string;
  supported: boolean;
  stablecoin: boolean;
  averageConfirmationTime: number; // minutes
  transactionFee: number; // USD equivalent
  volatility: 'low' | 'medium' | 'high';
}

export interface CryptoWallet {
  id: string;
  userId: string;
  addresses: Record<string, string>; // symbol -> address
  balances: Record<string, number>; // symbol -> balance
  lastUpdated: Date;
  verified: boolean;
  type: 'hot' | 'cold' | 'hardware' | 'exchange';
}

export interface CryptoPayment {
  id: string;
  userId: string;
  type: 'subscription' | 'proof_generation' | 'verification' | 'premium_feature';
  amount: number;
  currency: string; // USD
  cryptoAmount: number;
  cryptoCurrency: string;
  exchangeRate: number;
  status: 'pending' | 'confirming' | 'completed' | 'failed' | 'expired';
  walletAddress: string;
  transactionHash?: string;
  confirmations: number;
  requiredConfirmations: number;
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

export interface ExchangeRate {
  symbol: string;
  usdPrice: number;
  change24h: number;
  lastUpdated: Date;
  source: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  pricing: {
    monthly: number;
    yearly: number;
    payAsYouGo?: number;
  };
  cryptoDiscounts: Record<string, number>; // crypto symbol -> discount %
}

class CryptocurrencyPaymentService {
  private supportedCurrencies: Map<string, CryptoCurrency> = new Map();
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private wallets: Map<string, CryptoWallet> = new Map();
  private payments: Map<string, CryptoPayment> = new Map();
  private paymentPlans: Map<string, PaymentPlan> = new Map();

  constructor() {
    this.initializeSupportedCurrencies();
    this.initializePaymentPlans();
    this.startExchangeRateUpdates();
  }

  private initializeSupportedCurrencies() {
    const currencies: CryptoCurrency[] = [
      // Bitcoin
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        network: 'Bitcoin',
        decimals: 8,
        supported: true,
        stablecoin: false,
        averageConfirmationTime: 10,
        transactionFee: 5.00,
        volatility: 'high'
      },
      // Ethereum
      {
        symbol: 'ETH',
        name: 'Ethereum',
        network: 'Ethereum',
        decimals: 18,
        supported: true,
        stablecoin: false,
        averageConfirmationTime: 2,
        transactionFee: 3.00,
        volatility: 'high'
      },
      // Stablecoins
      {
        symbol: 'USDT',
        name: 'Tether USD',
        network: 'Ethereum',
        decimals: 6,
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        supported: true,
        stablecoin: true,
        averageConfirmationTime: 2,
        transactionFee: 2.50,
        volatility: 'low'
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        network: 'Ethereum',
        decimals: 6,
        contractAddress: '0xA0b86a33E6417D9C78E3f38D7b4eE4f8C5b7e8b1',
        supported: true,
        stablecoin: true,
        averageConfirmationTime: 2,
        transactionFee: 2.00,
        volatility: 'low'
      },
      {
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        network: 'Ethereum',
        decimals: 18,
        contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        supported: true,
        stablecoin: true,
        averageConfirmationTime: 2,
        transactionFee: 2.00,
        volatility: 'low'
      },
      // Alternative Cryptocurrencies
      {
        symbol: 'LTC',
        name: 'Litecoin',
        network: 'Litecoin',
        decimals: 8,
        supported: true,
        stablecoin: false,
        averageConfirmationTime: 2.5,
        transactionFee: 0.50,
        volatility: 'medium'
      },
      {
        symbol: 'ADA',
        name: 'Cardano',
        network: 'Cardano',
        decimals: 6,
        supported: true,
        stablecoin: false,
        averageConfirmationTime: 5,
        transactionFee: 0.20,
        volatility: 'medium'
      },
      {
        symbol: 'DOT',
        name: 'Polkadot',
        network: 'Polkadot',
        decimals: 10,
        supported: true,
        stablecoin: false,
        averageConfirmationTime: 1,
        transactionFee: 0.30,
        volatility: 'medium'
      }
    ];

    currencies.forEach(currency => {
      this.supportedCurrencies.set(currency.symbol, currency);
    });

    console.log(`💰 Initialized ${currencies.length} supported cryptocurrencies`);
  }

  private initializePaymentPlans() {
    const plans: PaymentPlan[] = [
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Essential identity verification features',
        features: [
          '10 proof generations per month',
          'Basic document verification',
          'Email support',
          'Standard security'
        ],
        pricing: {
          monthly: 9.99,
          yearly: 99.99
        },
        cryptoDiscounts: {
          'BTC': 10,
          'ETH': 8,
          'USDT': 5,
          'USDC': 5
        }
      },
      {
        id: 'pro',
        name: 'Professional Plan',
        description: 'Advanced features for professionals and small businesses',
        features: [
          '100 proof generations per month',
          'Advanced AI document verification',
          'Priority support',
          'Multi-signature verification',
          'API access'
        ],
        pricing: {
          monthly: 29.99,
          yearly: 299.99
        },
        cryptoDiscounts: {
          'BTC': 15,
          'ETH': 12,
          'USDT': 8,
          'USDC': 8,
          'DAI': 10
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        description: 'Full-featured solution for large organizations',
        features: [
          'Unlimited proof generations',
          'Custom verification workflows',
          'Dedicated support',
          'White-label solution',
          'Advanced analytics',
          'Blockchain integration'
        ],
        pricing: {
          monthly: 99.99,
          yearly: 999.99
        },
        cryptoDiscounts: {
          'BTC': 20,
          'ETH': 18,
          'USDT': 12,
          'USDC': 12,
          'DAI': 15,
          'LTC': 10
        }
      }
    ];

    plans.forEach(plan => {
      this.paymentPlans.set(plan.id, plan);
    });
  }

  // Payment Processing
  async createCryptoPayment(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    preferredCurrency: string
  ): Promise<CryptoPayment> {
    const plan = this.paymentPlans.get(planId);
    if (!plan) {
      throw new Error(`Payment plan not found: ${planId}`);
    }

    const currency = this.supportedCurrencies.get(preferredCurrency);
    if (!currency || !currency.supported) {
      throw new Error(`Cryptocurrency not supported: ${preferredCurrency}`);
    }

    const usdAmount = billingCycle === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;
    
    // Apply crypto discount
    const discount = plan.cryptoDiscounts[preferredCurrency] || 0;
    const discountedAmount = usdAmount * (1 - discount / 100);

    // Get current exchange rate
    const exchangeRate = await this.getExchangeRate(preferredCurrency);
    const cryptoAmount = discountedAmount / exchangeRate.usdPrice;

    // Generate payment
    const paymentId = `crypto-pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const walletAddress = await this.generatePaymentAddress(preferredCurrency);

    const payment: CryptoPayment = {
      id: paymentId,
      userId,
      type: 'subscription',
      amount: discountedAmount,
      currency: 'USD',
      cryptoAmount,
      cryptoCurrency: preferredCurrency,
      exchangeRate: exchangeRate.usdPrice,
      status: 'pending',
      walletAddress,
      confirmations: 0,
      requiredConfirmations: this.getRequiredConfirmations(preferredCurrency),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    this.payments.set(paymentId, payment);

    console.log(`💳 Created crypto payment: ${paymentId} for ${cryptoAmount} ${preferredCurrency}`);
    return payment;
  }

  private async generatePaymentAddress(currency: string): Promise<string> {
    // In a real implementation, this would generate a unique wallet address
    // For demo purposes, return a mock address
    const mockAddresses: Record<string, string> = {
      'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      'ETH': '0x742d35Cc6634C0532925a3b8D698765D96D4Ecce',
      'USDT': '0x742d35Cc6634C0532925a3b8D698765D96D4Ecce',
      'USDC': '0x742d35Cc6634C0532925a3b8D698765D96D4Ecce',
      'DAI': '0x742d35Cc6634C0532925a3b8D698765D96D4Ecce',
      'LTC': 'LTC1QREPLACEWITHACTUALADDRESS',
      'ADA': 'addr1REPLACEWITHACTUALADDRESS',
      'DOT': '1REPLACEWITHACTUALADDRESS'
    };

    return mockAddresses[currency] || mockAddresses['ETH'];
  }

  private getRequiredConfirmations(currency: string): number {
    const confirmations: Record<string, number> = {
      'BTC': 3,
      'ETH': 12,
      'USDT': 12,
      'USDC': 12,
      'DAI': 12,
      'LTC': 6,
      'ADA': 5,
      'DOT': 2
    };

    return confirmations[currency] || 6;
  }

  // Payment Monitoring
  async checkPaymentStatus(paymentId: string): Promise<CryptoPayment | null> {
    const payment = this.payments.get(paymentId);
    if (!payment) return null;

    // Simulate payment monitoring
    if (payment.status === 'pending') {
      await this.simulatePaymentProgress(payment);
    }

    return payment;
  }

  private async simulatePaymentProgress(payment: CryptoPayment): Promise<void> {
    // Simulate receiving a transaction
    if (Math.random() > 0.7) { // 30% chance of receiving payment
      payment.transactionHash = this.generateMockTransactionHash(payment.cryptoCurrency);
      payment.status = 'confirming';
      payment.confirmations = 1;
      
      console.log(`📨 Payment received: ${payment.id} - ${payment.transactionHash}`);
    }

    // Simulate confirmation progress
    if (payment.status === 'confirming') {
      const progressChance = 0.8; // 80% chance of confirmation progress
      if (Math.random() < progressChance) {
        payment.confirmations = Math.min(
          payment.confirmations + 1, 
          payment.requiredConfirmations
        );

        if (payment.confirmations >= payment.requiredConfirmations) {
          payment.status = 'completed';
          payment.completedAt = new Date();
          console.log(`✅ Payment confirmed: ${payment.id}`);
        }
      }
    }

    // Handle expiration
    if (payment.status === 'pending' && new Date() > payment.expiresAt) {
      payment.status = 'expired';
      console.log(`⏰ Payment expired: ${payment.id}`);
    }
  }

  private generateMockTransactionHash(currency: string): string {
    const prefixes: Record<string, string> = {
      'BTC': '',
      'ETH': '0x',
      'USDT': '0x',
      'USDC': '0x',
      'DAI': '0x',
      'LTC': '',
      'ADA': '',
      'DOT': '0x'
    };

    const prefix = prefixes[currency] || '0x';
    const hash = Math.random().toString(16).substring(2).padStart(64, '0');
    
    return prefix + hash;
  }

  // Exchange Rate Management
  async getExchangeRate(symbol: string): Promise<ExchangeRate> {
    let rate = this.exchangeRates.get(symbol);
    
    if (!rate || this.isRateStale(rate)) {
      rate = await this.fetchExchangeRate(symbol);
      this.exchangeRates.set(symbol, rate);
    }

    return rate;
  }

  private isRateStale(rate: ExchangeRate): boolean {
    const maxAge = 5 * 60 * 1000; // 5 minutes
    return Date.now() - rate.lastUpdated.getTime() > maxAge;
  }

  private async fetchExchangeRate(symbol: string): Promise<ExchangeRate> {
    // Simulate fetching from exchange API
    const mockPrices: Record<string, number> = {
      'BTC': 42000 + Math.random() * 8000,
      'ETH': 2500 + Math.random() * 1000,
      'USDT': 1.00 + (Math.random() - 0.5) * 0.02,
      'USDC': 1.00 + (Math.random() - 0.5) * 0.01,
      'DAI': 1.00 + (Math.random() - 0.5) * 0.03,
      'LTC': 80 + Math.random() * 40,
      'ADA': 0.5 + Math.random() * 0.8,
      'DOT': 6 + Math.random() * 4
    };

    return {
      symbol,
      usdPrice: mockPrices[symbol] || 1.0,
      change24h: (Math.random() - 0.5) * 20, // -10% to +10%
      lastUpdated: new Date(),
      source: 'CoinGecko API'
    };
  }

  private startExchangeRateUpdates(): void {
    // Update exchange rates every 5 minutes
    setInterval(async () => {
      for (const currency of this.supportedCurrencies.keys()) {
        try {
          const rate = await this.fetchExchangeRate(currency);
          this.exchangeRates.set(currency, rate);
        } catch (error) {
          console.error(`Failed to update ${currency} exchange rate:`, error);
        }
      }
    }, 5 * 60 * 1000);
  }

  // Wallet Management
  async createCryptoWallet(userId: string): Promise<string> {
    const walletId = `wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const wallet: CryptoWallet = {
      id: walletId,
      userId,
      addresses: {},
      balances: {},
      lastUpdated: new Date(),
      verified: false,
      type: 'hot'
    };

    // Generate addresses for supported currencies
    for (const currency of this.supportedCurrencies.keys()) {
      wallet.addresses[currency] = await this.generatePaymentAddress(currency);
      wallet.balances[currency] = 0;
    }

    this.wallets.set(walletId, wallet);
    
    console.log(`👛 Created crypto wallet: ${walletId} for user ${userId}`);
    return walletId;
  }

  async getWallet(userId: string): Promise<CryptoWallet | null> {
    for (const wallet of this.wallets.values()) {
      if (wallet.userId === userId) {
        return wallet;
      }
    }
    return null;
  }

  // Payment Analytics
  async getPaymentAnalytics(): Promise<{
    totalPayments: number;
    totalRevenue: number;
    averagePayment: number;
    currencyDistribution: Record<string, number>;
    conversionRate: number;
    topCurrencies: Array<{ symbol: string; count: number; revenue: number }>;
  }> {
    const payments = Array.from(this.payments.values());
    const completedPayments = payments.filter(p => p.status === 'completed');

    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const averagePayment = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0;

    const currencyDistribution = completedPayments.reduce((acc, payment) => {
      acc[payment.cryptoCurrency] = (acc[payment.cryptoCurrency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const conversionRate = payments.length > 0 ? completedPayments.length / payments.length : 0;

    const currencyRevenue = completedPayments.reduce((acc, payment) => {
      if (!acc[payment.cryptoCurrency]) {
        acc[payment.cryptoCurrency] = { count: 0, revenue: 0 };
      }
      acc[payment.cryptoCurrency].count++;
      acc[payment.cryptoCurrency].revenue += payment.amount;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const topCurrencies = Object.entries(currencyRevenue)
      .map(([symbol, data]) => ({ symbol, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalPayments: payments.length,
      totalRevenue,
      averagePayment,
      currencyDistribution,
      conversionRate,
      topCurrencies
    };
  }

  // Utility Methods
  getSupportedCurrencies(): CryptoCurrency[] {
    return Array.from(this.supportedCurrencies.values()).filter(c => c.supported);
  }

  getPaymentPlans(): PaymentPlan[] {
    return Array.from(this.paymentPlans.values());
  }

  async estimateTransactionFee(currency: string, amount: number): Promise<{
    fee: number;
    feeUSD: number;
    estimatedTime: string;
  }> {
    const currencyData = this.supportedCurrencies.get(currency);
    if (!currencyData) {
      throw new Error(`Currency not supported: ${currency}`);
    }

    const exchangeRate = await this.getExchangeRate(currency);
    const feeUSD = currencyData.transactionFee;
    const fee = feeUSD / exchangeRate.usdPrice;

    return {
      fee,
      feeUSD,
      estimatedTime: `${currencyData.averageConfirmationTime} minutes`
    };
  }
}

export const cryptocurrencyPaymentService = new CryptocurrencyPaymentService();