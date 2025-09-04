import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    claims: any;
    access_token: string;
    refresh_token?: string;
    expires_at: number;
  };
}

// Enhanced authentication middleware with better error handling
export function isAuthenticated(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const sessionData = {
    isAuthenticated: !!req.user,
    hasUser: !!req.user?.claims,
    userExpiry: req.user?.expires_at,
    sessionID: req.sessionID
  };

  console.log('🔐 Auth check:', sessionData);

  // Check if user session exists
  if (!req.user) {
    console.log('❌ Authentication failed: { authenticated: false, hasUser: false, hasExpiry: false }');
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if user claims exist
  if (!req.user.claims) {
    console.log('❌ Authentication failed: No user claims found');
    return res.status(401).json({ message: "Invalid session - no user claims" });
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (req.user.expires_at && req.user.expires_at < now) {
    console.log('❌ Authentication failed: Token expired');
    return res.status(401).json({ message: "Token expired" });
  }

  // Check if required user fields exist
  if (!req.user.claims.sub) {
    console.log('❌ Authentication failed: Missing user ID');
    return res.status(401).json({ message: "Invalid user session" });
  }

  console.log('✅ Authentication successful:', {
    userId: req.user.claims.sub,
    email: req.user.claims.email,
    expiresAt: new Date(req.user.expires_at * 1000).toISOString()
  });

  next();
}

// Middleware for API key authentication (alternative to session auth)
export function isAPIAuthenticated(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  const authorization = req.headers['authorization'];

  if (!apiKey && !authorization) {
    return res.status(401).json({
      message: "API key or authorization token required",
      error: "MISSING_AUTH"
    });
  }

  // Simple API key validation (in production, validate against database)
  if (apiKey) {
    // TODO: Validate API key against database
    console.log('🔑 API Key authentication:', apiKey.substring(0, 8) + '...');
    req.user = {
      claims: { sub: 'api-user', api_key: apiKey },
      access_token: apiKey,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };
    return next();
  }

  // Bearer token validation
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.substring(7);
    // TODO: Validate JWT token
    console.log('🎫 Bearer token authentication');
    req.user = {
      claims: { sub: 'bearer-user' },
      access_token: token,
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };
    return next();
  }

  return res.status(401).json({
    message: "Invalid authentication credentials",
    error: "INVALID_AUTH"
  });
}

// Optional authentication - proceed even if not authenticated
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Log authentication attempt but don't block
  if (req.user) {
    console.log('👤 Optional auth: User present');
  } else {
    console.log('👤 Optional auth: Anonymous user');
  }
  next();
}

// Role-based authentication
export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // First check if authenticated
    isAuthenticated(req, res, () => {
      const userRole = req.user?.claims?.role || 'customer';
      
      if (!roles.includes(userRole)) {
        console.log(`❌ Authorization failed: User role '${userRole}' not in required roles:`, roles);
        return res.status(403).json({
          message: "Insufficient permissions",
          required: roles,
          current: userRole
        });
      }

      console.log(`✅ Authorization successful: User role '${userRole}' matches required roles`);
      next();
    });
  };
}