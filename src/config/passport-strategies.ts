/**
 * @description
 * Configures and initializes Passport authentication strategies (Local & JWT).
 *
 * Key features:
 * - LocalStrategy: Validates user email and password using bcrypt.
 * - JwtStrategy: Validates JWT tokens by verifying signature and checking user existence in DB.
 * - Uses an extended interface (UserWithRoles) to handle the additional 'roles' property.
 *
 * @dependencies
 * - passport, passport-local, passport-jwt
 * - bcrypt for password comparison
 * - prisma client for database lookups
 *
 * @notes
 * - The Local Strategy expects `req.body.email` and `req.body.password`.
 * - The JWT Strategy expects a token with payload containing userId or id.
 * - We flatten the userRoles into an array of role names (user.roles = ['ADMIN', 'USER', etc.]).
 */

import { PrismaClient, User, UserRole, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

// 1. Create an extended interface for the user that includes userRoles and a 'roles' property
interface UserWithRoles extends User {
  userRoles: (UserRole & {
    role: Role;
  })[];
  roles?: string[];
}

const prisma = new PrismaClient();

/**
 * Local Strategy
 * ----------------------------------------------------------------------------
 * Used to verify the email and password at login time.
 * Expects email & password fields in the request body.
 */
const localOpts = {
  usernameField: 'email',
  passwordField: 'password',
};

passport.use(
  new LocalStrategy(localOpts, async (email, password, done) => {
    try {
      // 2. Find user by email, including userRoles -> role
      const user = (await prisma.user.findUnique({
        where: { email: email },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      })) as UserWithRoles | null;

      if (!user) {
        return done(null, false, {
          message: 'Invalid credentials (user not found).',
        });
      }

      // 3. Compare password with stored hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, {
          message: 'Invalid credentials (password mismatch).',
        });
      }

      // 4. Flatten roles into an array of strings
      user.roles = user.userRoles.map((ur) => ur.role.name);

      // 5. Return user
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

/**
 * JWT Strategy
 * ----------------------------------------------------------------------------
 * Authenticates requests based on JWT tokens.
 * Token is typically in the Authorization header as "Bearer <token>"
 * The JWT payload must contain { id: string } referencing the user ID.
 */
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'changeme', // Fallback for dev if not set
};

passport.use(
  new JwtStrategy(jwtOpts, async (payload, done) => {
    try {
      // 6. Lookup user by the id in the JWT payload, including userRoles -> role
      const user = (await prisma.user.findUnique({
        where: { id: payload.id },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      })) as UserWithRoles | null;

      if (!user) {
        return done(null, false, {
          message: 'Token not valid (user does not exist).',
        });
      }

      // 7. Flatten roles into an array of strings
      user.roles = user.userRoles.map((ur) => ur.role.name);

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
 * - This function can be called in app.ts if needed. The presence of `passport.use(...)`
 *   calls automatically loads the strategies when this file is imported.
 */
export function initPassportStrategies(): void {
  return;
}

