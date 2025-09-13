# Veridity Mobile App

A complete React Native application for privacy-first digital identity verification.

## Features

- 🔐 **Biometric Authentication** - TouchID/FaceID support
- 📱 **Offline-First** - Works without internet connection
- 🛡️ **Zero-Knowledge Proofs** - Privacy-preserving identity verification
- 🌍 **Bilingual Support** - English and Nepali
- 📲 **Push Notifications** - Real-time updates
- 🎯 **Modern UI** - Clean, accessible design

## Quick Start

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

## Configuration

Update the API endpoint in `src/utils/api.ts`:

```typescript
const API_BASE_URL = 'https://your-backend-url.com';
```

## Build for Production

```bash
# iOS
npx react-native run-ios --configuration Release

# Android
npx react-native run-android --variant=release
```

## Architecture

- **App.tsx** - Main application with navigation
- **src/components/** - Reusable UI components
- **src/screens/** - Application screens
- **src/utils/** - Utilities and API client

## Testing

```bash
npm test
```

Built for Nepal's digital identity needs with privacy at the core.