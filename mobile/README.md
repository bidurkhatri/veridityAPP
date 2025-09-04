# Veridity Mobile App Foundation

This directory contains the foundation for Veridity's native mobile applications.

## Architecture Overview

### React Native Foundation
- **Cross-platform**: Single codebase for iOS and Android
- **Offline-first**: Core functionality works without internet
- **Security-focused**: Biometric authentication and secure storage
- **Voice-enabled**: Full voice navigation in English and Nepali

### Key Features
- **Zero-Knowledge Proofs**: Generate and verify proofs on-device
- **Biometric Auth**: Fingerprint and Face ID integration
- **QR Code Scanning**: Fast proof sharing and verification
- **Voice Navigation**: Complete voice control system
- **Offline Sync**: Works without internet, syncs when connected

## Getting Started

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Installation
```bash
# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure
```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   ├── services/           # API and business logic
│   ├── utils/              # Helper functions
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript definitions
├── android/                # Android-specific code
├── ios/                   # iOS-specific code
└── __tests__/             # Test files
```

## Core Services

### Proof Generation Service
Handles ZK proof generation using WebAssembly circuits compiled for mobile.

### Biometric Service
Integrates with device biometric authentication (TouchID, FaceID, Fingerprint).

### Voice Navigation Service
Provides voice commands in English and Nepali using device speech recognition.

### Offline Storage Service
Secure local storage for proofs and user data using encrypted SQLite.

## Development Roadmap

### Phase 1: Core Foundation (Current)
- Basic app structure and navigation
- Authentication flow
- Proof generation UI
- QR code scanning

### Phase 2: Advanced Features
- Biometric authentication
- Voice navigation
- Offline synchronization
- Push notifications

### Phase 3: Platform Integration
- Deep linking
- Widget support
- Background sync
- Platform-specific optimizations

## Security Considerations

### Data Protection
- All sensitive data encrypted at rest
- Biometric authentication for app access
- Secure communication with backend
- Certificate pinning for API calls

### Privacy Features
- Local proof generation (no data sent to servers)
- Optional cloud backup with user consent
- Clear data retention policies
- User-controlled data sharing

## Testing Strategy

### Unit Tests
- Service layer testing
- Utility function testing
- Component testing

### Integration Tests
- End-to-end proof generation
- Authentication flows
- Offline/online sync

### Device Testing
- Multiple device sizes and OS versions
- Performance testing
- Battery usage optimization
- Network condition testing

## Deployment

### App Store Distribution
- iOS App Store submission
- Google Play Store submission
- Enterprise distribution options
- Beta testing via TestFlight/Play Console

### CI/CD Pipeline
- Automated testing
- Code signing
- Binary generation
- Store submission automation

## Contributing

1. Follow React Native best practices
2. Use TypeScript for all new code
3. Include unit tests for new features
4. Test on multiple devices and OS versions
5. Follow accessibility guidelines

## License

Proprietary - Veridity Platform