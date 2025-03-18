/**
 * @description
 * Configures and initializes Passport authentication strategies (Local & JWT).
 *
 * Key features:
 * - LocalStrategy: Validates user email and password using bcrypt.
 * - JwtStrategy: Validates JWT tokens by verifying signature and checking user existence in DB.
 *
 * @dependencies
 * - passport, passport-local, passport-jwt
 * - bcrypt for password comparison
 * - prisma client for database lookups
 *
 * @notes
 * - The Local Strategy expects `req.body.email` and `req.body.password`.
 * - The JWT Strategy expects a token with payload containing userId or id.
 * - In this example, we store user ID under 'id' in the JWT payload.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

// Instantiate Prisma client for DB queries
const prisma = new PrismaClient();

/**
 * Local Strategy
 * ----------------------------------------------------------------------------
 * This strategy is used to verify the email and password at login time.
 * We expect email & password fields in the request body.
 */
const localOpts = {
  usernameField: 'email',
  passwordField: 'password',
};

passport.use(
  new LocalStrategy(localOpts, async (email, password, done) => {
    try {
      // 1. Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        // User not found
        return done(null, false, {
          message: 'Invalid credentials (user not found).',
        });
      }

      // 2. Compare password with stored hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, {
          message: 'Invalid credentials (password mismatch).',
        });
      }

      // 3. If valid, return user
      return done(null, user);
    } catch (error) {
      // If DB or any other error
      return done(error);
    }
  }),
);

/**
 * JWT Strategy
 * ----------------------------------------------------------------------------
 * This strategy is used to authenticate requests based on JWT tokens.
 * The token is typically provided in the Authorization header as:
 *   Authorization: Bearer <token>
 * The JWT payload must contain { id: string } referencing the user ID.
 */
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'changeme', // Fallback for dev if not set
};

passport.use(
  new JwtStrategy(jwtOpts, async (payload, done) => {
    try {
      // 1. Lookup user by the id in the JWT payload
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        return done(null, false, {
          message: 'Token not valid (user does not exist).',
        });
      }

      // 2. If user is found, attach to request
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }),
);

/**
 * A helper function to ensure passport strategies are loaded.
 *
 * @notes
 * - This function is optional. The presence of `passport.use(...)` calls
 *   automatically loads the strategies when this file is imported.
 */
export function initPassportStrategies(): void {
  // This function ensures the strategies above are registered.
  // It can be imported and called in app.ts if desired.
  // Currently, the strategies are set up at import time.
  return;
}
