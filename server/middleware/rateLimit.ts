import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { rateLimits } from "@shared/schema";
import { eq, and, gte } from "drizzle-orm";
import { RATE_LIMITS } from "./security";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

export function createRateLimit(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = options.keyGenerator ? options.keyGenerator(req) : req.ip;
      const windowStart = new Date(Date.now() - options.windowMs);
      
      // Get current count for this window
      const [existing] = await db
        .select()
        .from(rateLimits)
        .where(
          and(
            eq(rateLimits.identifier, key),
            gte(rateLimits.window, windowStart)
          )
        )
        .limit(1);
      
      if (existing && existing.count >= options.maxRequests) {
        return res.status(429).json({
          error: "RATE_LIMIT_EXCEEDED",
          message: options.message || "Too many requests",
          retryAfter: Math.ceil(options.windowMs / 1000),
        });
      }
      
      // Update or create rate limit record
      if (existing) {
        await db
          .update(rateLimits)
          .set({ 
            count: existing.count + 1,
            updatedAt: new Date()
          })
          .where(eq(rateLimits.id, existing.id));
      } else {
        await db
          .insert(rateLimits)
          .values({
            identifier: key,
            window: new Date(),
            count: 1,
          });
      }
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - (existing?.count || 0) - 1));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + options.windowMs).toISOString());
      
      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // Don't block requests on rate limit errors
      next();
    }
  };
}

// Pre-configured rate limiters
export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: RATE_LIMITS.API_PER_MINUTE,
  message: "Too many API requests",
});

export const verifyRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: RATE_LIMITS.VERIFY_PER_HOUR,
  keyGenerator: (req) => req.headers['x-api-key'] as string || req.ip,
  message: "Too many verification requests",
});

export const authRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: RATE_LIMITS.AUTH_PER_MINUTE,
  message: "Too many authentication attempts",
});