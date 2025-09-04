import type { Express, Request, Response, NextFunction } from "express";
import crypto from 'crypto';
// @ts-ignore
const geoip = require('geoip-lite');

// Enhanced rate limiting store with IP tracking
const rateLimitStore = new Map<string, { count: number; resetTime: number; violations: number }>();
const deviceStore = new Map<string, { fingerprint: string; firstSeen: Date; lastSeen: Date; requestCount: number }>();
const ipBlacklist = new Set<string>();
const suspiciousIPs = new Map<string, { score: number; reasons: string[] }>();

export interface DeviceFingerprint {
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  screenResolution?: string;
  timezone?: string;
  canvas?: string;
  webgl?: string;
}

export interface SecurityMetrics {
  requestsBlocked: number;
  suspiciousActivity: number;
  deviceFingerprints: number;
  ipAddressesTracked: number;
}

class SecurityEnhancement {
  private metrics: SecurityMetrics = {
    requestsBlocked: 0,
    suspiciousActivity: 0,
    deviceFingerprints: 0,
    ipAddressesTracked: 0
  };

  // Generate device fingerprint from request headers
  generateDeviceFingerprint(req: Request): string {
    const fingerprint: DeviceFingerprint = {
      userAgent: req.headers['user-agent'] || '',
      acceptLanguage: req.headers['accept-language'] || '',
      acceptEncoding: req.headers['accept-encoding'] || '',
      screenResolution: req.headers['x-screen-resolution'] as string,
      timezone: req.headers['x-timezone'] as string,
      canvas: req.headers['x-canvas-fingerprint'] as string,
      webgl: req.headers['x-webgl-fingerprint'] as string
    };

    const fingerprintString = JSON.stringify(fingerprint);
    return crypto.createHash('sha256').update(fingerprintString).digest('hex');
  }

  // Track device and detect anomalies
  trackDevice(req: Request): { deviceId: string; isNewDevice: boolean; isSuspicious: boolean } {
    const deviceId = this.generateDeviceFingerprint(req);
    const now = new Date();
    const clientIP = this.getClientIP(req);

    let device = deviceStore.get(deviceId);
    const isNewDevice = !device;

    if (!device) {
      device = {
        fingerprint: deviceId,
        firstSeen: now,
        lastSeen: now,
        requestCount: 1
      };
      this.metrics.deviceFingerprints++;
    } else {
      device.lastSeen = now;
      device.requestCount++;
    }

    deviceStore.set(deviceId, device);

    // Check for suspicious activity
    const isSuspicious = this.detectSuspiciousDevice(device, clientIP);

    return { deviceId, isNewDevice, isSuspicious };
  }

  // Enhanced IP geolocation and blocking
  checkIPLocation(req: Request): { country: string; region: string; city: string; isBlocked: boolean; risk: 'low' | 'medium' | 'high' } {
    const clientIP = this.getClientIP(req);
    const geo = geoip.lookup(clientIP);

    if (!geo) {
      return { country: 'unknown', region: 'unknown', city: 'unknown', isBlocked: false, risk: 'medium' };
    }

    // Check against blocked countries/regions
    const blockedCountries = ['CN', 'RU', 'KP']; // Example blocked countries
    const isBlocked = blockedCountries.includes(geo.country);

    // Risk assessment based on location
    const highRiskCountries = ['CN', 'RU', 'IR', 'KP'];
    const mediumRiskCountries = ['VN', 'BD', 'PK'];
    
    let risk: 'low' | 'medium' | 'high' = 'low';
    if (highRiskCountries.includes(geo.country)) risk = 'high';
    else if (mediumRiskCountries.includes(geo.country)) risk = 'medium';

    if (isBlocked) {
      this.metrics.requestsBlocked++;
      ipBlacklist.add(clientIP);
    }

    return {
      country: geo.country,
      region: geo.region,
      city: geo.city,
      isBlocked,
      risk
    };
  }

  // Advanced rate limiting with progressive penalties
  advancedRateLimit(req: Request): { allowed: boolean; remaining: number; resetTime: number } {
    const clientIP = this.getClientIP(req);
    const now = Date.now();
    const windowSize = 15 * 60 * 1000; // 15 minutes
    let baseLimit = 100; // Base requests per window

    let userLimit = rateLimitStore.get(clientIP);

    if (!userLimit || now > userLimit.resetTime) {
      userLimit = {
        count: 1,
        resetTime: now + windowSize,
        violations: userLimit?.violations || 0
      };
    } else {
      userLimit.count++;
    }

    // Reduce limit for repeat violators
    const adjustedLimit = Math.max(10, baseLimit - (userLimit.violations * 20));

    if (userLimit.count > adjustedLimit) {
      userLimit.violations++;
      this.addSuspiciousActivity(clientIP, 'Rate limit exceeded');
      rateLimitStore.set(clientIP, userLimit);
      return { allowed: false, remaining: 0, resetTime: userLimit.resetTime };
    }

    rateLimitStore.set(clientIP, userLimit);
    return { 
      allowed: true, 
      remaining: Math.max(0, adjustedLimit - userLimit.count),
      resetTime: userLimit.resetTime
    };
  }

  // Detect suspicious device behavior
  private detectSuspiciousDevice(device: any, clientIP: string): boolean {
    const now = new Date();
    const hoursSinceFirstSeen = (now.getTime() - device.firstSeen.getTime()) / (1000 * 60 * 60);
    
    // New device with high activity
    if (hoursSinceFirstSeen < 1 && device.requestCount > 50) {
      this.addSuspiciousActivity(clientIP, 'High activity from new device');
      return true;
    }

    // Very high request rate
    if (device.requestCount > 1000) {
      this.addSuspiciousActivity(clientIP, 'Extremely high request count');
      return true;
    }

    return false;
  }

  // Add suspicious activity tracking
  private addSuspiciousActivity(clientIP: string, reason: string): void {
    let suspicious = suspiciousIPs.get(clientIP);
    if (!suspicious) {
      suspicious = { score: 0, reasons: [] };
    }

    suspicious.score += 10;
    suspicious.reasons.push(`${new Date().toISOString()}: ${reason}`);
    
    if (suspicious.score > 100) {
      ipBlacklist.add(clientIP);
      this.metrics.requestsBlocked++;
    }

    suspiciousIPs.set(clientIP, suspicious);
    this.metrics.suspiciousActivity++;
  }

  // Get real client IP (handles proxies)
  private getClientIP(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    const forwardedIP = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    
    return (
      req.headers['cf-connecting-ip'] ||
      req.headers['x-real-ip'] ||
      forwardedIP?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown'
    ) as string;
  }

  // Get security metrics
  getMetrics(): SecurityMetrics & { 
    suspiciousIPs: Array<{ ip: string; score: number; reasons: string[] }>;
    blockedIPs: string[];
  } {
    return {
      ...this.metrics,
      suspiciousIPs: Array.from(suspiciousIPs.entries()).map(([ip, data]) => ({ ip, ...data })),
      blockedIPs: Array.from(ipBlacklist)
    };
  }

  // Clean up old data
  cleanup(): void {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Clean old rate limit entries
    for (const [key, value] of Array.from(rateLimitStore.entries())) {
      if (now > value.resetTime + oneDay) {
        rateLimitStore.delete(key);
      }
    }

    // Clean old device entries
    for (const [key, device] of Array.from(deviceStore.entries())) {
      if (now > device.lastSeen.getTime() + (7 * oneDay)) {
        deviceStore.delete(key);
      }
    }

    console.log('🧹 Security data cleanup completed');
  }
}

export const securityEnhancement = new SecurityEnhancement();

// Enhanced security middleware
export function enhancedSecurityMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = securityEnhancement['getClientIP'](req);

    // Check IP blacklist
    if (ipBlacklist.has(clientIP)) {
      console.log(`🚫 Blocked request from blacklisted IP: ${clientIP}`);
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        message: 'Your IP address has been blocked due to suspicious activity'
      });
    }

    // Check geolocation
    const locationCheck = securityEnhancement.checkIPLocation(req);
    if (locationCheck.isBlocked) {
      console.log(`🌍 Blocked request from restricted location: ${locationCheck.country}`);
      return res.status(403).json({
        error: 'GEO_BLOCKED',
        message: 'Access from your location is not permitted'
      });
    }

    // Track device
    const deviceInfo = securityEnhancement.trackDevice(req);
    if (deviceInfo.isSuspicious) {
      console.log(`⚠️ Suspicious device detected: ${deviceInfo.deviceId}`);
      // Add additional security headers but don't block yet
      res.setHeader('X-Security-Alert', 'suspicious-device');
    }

    // Advanced rate limiting
    const rateLimit = securityEnhancement.advancedRateLimit(req);
    if (!rateLimit.allowed) {
      console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`);
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      });
    }

    // Add security headers
    res.setHeader('X-Rate-Limit-Remaining', rateLimit.remaining.toString());
    res.setHeader('X-Rate-Limit-Reset', rateLimit.resetTime.toString());
    res.setHeader('X-Device-ID', deviceInfo.deviceId);
    res.setHeader('X-Location-Risk', locationCheck.risk);

    next();
  };
}

// Clean up security data periodically
setInterval(() => {
  securityEnhancement.cleanup();
}, 60 * 60 * 1000); // Every hour

// Export the singleton instance