import { Router } from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { storage } from "./storage";

const router = Router();

// Email/Password Registration Schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Email/Password Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        message: 'An account with this email already exists' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await storage.createUser({
      email,
      firstName,
      lastName,
      passwordHash,
      provider: 'email',
    });

    // Log user in
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Registration successful but login failed' });
      }
      res.json({ 
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors 
      });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Email/Password Login
router.post('/email/login', (req, res, next) => {
  try {
    loginSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors 
      });
    }
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ 
        message: info?.message || 'Invalid credentials' 
      });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed' });
      }
      
      res.json({ 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    });
  })(req, res, next);
});

// OAuth Routes - Currently not configured
router.get('/google', (req, res) => {
  res.redirect('/?error=oauth_not_configured&provider=Google');
});

router.get('/google/callback', (req, res) => {
  res.redirect('/?error=oauth_not_configured&provider=Google');
});

router.get('/github', (req, res) => {
  res.redirect('/?error=oauth_not_configured&provider=GitHub');
});

router.get('/github/callback', (req, res) => {
  res.redirect('/?error=oauth_not_configured&provider=GitHub');
});

router.get('/microsoft', (req, res) => {
  res.redirect('/?error=oauth_not_configured&provider=Microsoft');
});

router.get('/microsoft/callback', (req, res) => {
  res.redirect('/?error=oauth_not_configured&provider=Microsoft');
});

// WebAuthn Routes (Placeholder for future implementation)
router.post('/webauthn/register', async (req, res) => {
  res.status(501).json({ 
    message: 'WebAuthn registration will be available soon' 
  });
});

router.post('/webauthn/authenticate', async (req, res) => {
  res.json({ 
    available: false,
    message: 'WebAuthn authentication will be available in a future update' 
  });
});

export default router;