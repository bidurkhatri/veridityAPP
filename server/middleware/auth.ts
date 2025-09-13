import type { RequestHandler } from "express";

// Unified authentication middleware that works with both OIDC and email/password
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // For email/password users, we just check if they're logged in
  // For OIDC users, we check token expiration
  if (user.provider === 'email') {
    return next();
  }
  
  // OIDC token expiration check (legacy)
  if (!user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  const bufferSeconds = 300; // 5 minutes buffer
  
  if (now + bufferSeconds <= user.expires_at) {
    return next();
  }

  // For expired OIDC tokens, require re-login
  return res.status(401).json({ message: "Session expired. Please log in again." });
};