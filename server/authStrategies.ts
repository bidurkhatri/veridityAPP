import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

// Email/Password Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Transform user to consistent format for the app
      const transformedUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        provider: user.provider,
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName
        },
        // For email users, we don't need token refresh
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days from now
      };
      
      return done(null, transformedUser);
    } catch (error) {
      return done(error);
    }
  }
));

// OAuth strategies will be implemented once all dependencies are properly configured
const setupOAuthStrategies = () => {
  console.log('📧 Email/Password authentication enabled');
  // Future: Google, GitHub, Microsoft OAuth strategies will be added here
};

setupOAuthStrategies();

export { passport };