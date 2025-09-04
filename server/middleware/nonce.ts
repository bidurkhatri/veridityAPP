import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { nonces } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { NONCE_CONFIG } from "./security";
import crypto from "crypto";

export interface NonceRequest extends Request {
  nonce?: {
    value: string;
    partnerId: string;
  };
}

// Generate a cryptographically secure nonce
export function generateNonce(): string {
  return crypto.randomBytes(NONCE_CONFIG.LENGTH).toString('base64url');
}

// Middleware to validate and consume nonces (replay protection)
export function validateNonce() {
  return async (req: NonceRequest, res: Response, next: NextFunction) => {
    try {
      const nonce = req.body.nonce || req.query.nonce;
      const partnerId = req.headers['x-api-key'] as string || 'anonymous';
      
      if (!nonce) {
        return res.status(400).json({
          error: "NONCE_REQUIRED",
          message: "Nonce is required for this operation"
        });
      }
      
      // Check if nonce has been used
      const [existingNonce] = await db
        .select()
        .from(nonces)
        .where(
          and(
            eq(nonces.partnerId, partnerId),
            eq(nonces.nonce, nonce)
          )
        )
        .limit(1);
      
      if (existingNonce) {
        return res.status(409).json({
          error: "NONCE_REPLAY",
          message: "This nonce has already been used"
        });
      }
      
      // Store nonce to prevent replay
      const expiresAt = new Date(Date.now() + (NONCE_CONFIG.TTL_HOURS * 60 * 60 * 1000));
      await db
        .insert(nonces)
        .values({
          id: `${partnerId}:${nonce}`,
          partnerId,
          nonce,
          expiresAt,
        });
      
      // Add nonce info to request for downstream use
      req.nonce = {
        value: nonce,
        partnerId,
      };
      
      next();
    } catch (error) {
      console.error('Nonce validation error:', error);
      return res.status(500).json({
        error: "NONCE_VALIDATION_ERROR",
        message: "Failed to validate nonce"
      });
    }
  };
}

// Cleanup expired nonces (should be run periodically)
export async function cleanupExpiredNonces() {
  try {
    const now = new Date();
    await db
      .delete(nonces)
      .where(eq(nonces.expiresAt, now));
    
    console.log('Cleaned up expired nonces');
  } catch (error) {
    console.error('Failed to cleanup nonces:', error);
  }
}