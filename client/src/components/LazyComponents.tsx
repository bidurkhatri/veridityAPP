/**
 * Lazy loaded components for code splitting
 */

import { lazy, Suspense } from 'react';
import { PageLoader } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load heavy components
export const LazyProofGeneration = lazy(() => import('@/pages/ProofGeneration'));
export const LazyQRScanner = lazy(() => import('@/components/QRScanner'));
export const LazyBiometricAuth = lazy(() => import('@/components/BiometricAuth'));
export const LazyDocumentUpload = lazy(() => import('@/components/DocumentUpload'));
export const LazyOrganizationDashboard = lazy(() => import('@/pages/OrganizationDashboard'));
export const LazyVoiceHelpOverlay = lazy(() => import('@/components/VoiceHelpOverlay'));

// HOC for wrapping lazy components
export function withLazyLoading<T extends {}>(
  Component: React.LazyExoticComponent<React.ComponentType<T>>,
  fallback?: React.ReactNode
) {
  return function LazyWrapper(props: T) {
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback || <PageLoader />}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// Pre-wrapped components ready to use
export const ProofGeneration = withLazyLoading(LazyProofGeneration);
export const QRScanner = withLazyLoading(LazyQRScanner);
export const BiometricAuth = withLazyLoading(LazyBiometricAuth);
export const DocumentUpload = withLazyLoading(LazyDocumentUpload);
export const OrganizationDashboard = withLazyLoading(LazyOrganizationDashboard);
export const VoiceHelpOverlay = withLazyLoading(LazyVoiceHelpOverlay);

// Preload critical components when idle
export function preloadCriticalComponents() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      LazyProofGeneration();
      LazyQRScanner();
    });
  }
}