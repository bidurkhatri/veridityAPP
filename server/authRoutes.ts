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

// Google OAuth Routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/?error=google_auth_failed' }),
  (req, res) => {
    res.redirect('/');
  }
);

// GitHub OAuth Routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/?error=github_auth_failed' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Microsoft OAuth Routes
router.get('/microsoft',
  passport.authenticate('microsoft', { 
    prompt: 'select_account'
  })
);

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/?error=microsoft_auth_failed' }),
  (req, res) => {
    res.redirect('/');
  }
);

// WebAuthn Routes (Placeholder for future implementation)
router.post('/webauthn/register', async (req, res) => {
  res.status(501).json({ 
    message: 'WebAuthn registration will be available soon' 
  });
});

router.post('/webauthn/authenticate', async (req, res) => {
  res.status(501).json({ 
    message: 'WebAuthn authentication will be available soon' 
  });
});

export default router;