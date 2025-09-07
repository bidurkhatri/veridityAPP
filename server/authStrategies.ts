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

      return done(null, user);
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