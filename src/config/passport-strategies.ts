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
 * - The JWT Strategy expects a token in an HttpOnly cookie (hier aangepast).
 * - We flatten the userRoles into an array of role names (user.roles = ['ADMIN', 'USER', etc.]).
 */

import { PrismaClient, User, UserRole, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {
  Strategy as JwtStrategy,
  StrategyOptions,
  ExtractJwt,
  VerifiedCallback,
} from 'passport-jwt';
import { Request } from 'express';

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

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, {
          message: 'Invalid credentials (password mismatch).',
        });
      }

      user.roles = user.userRoles.map((ur) => ur.role.name);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

/**
 * Cookie Extractor
 * ----------------------------------------------------------------------------
 * Haalt de JWT uit de HttpOnly cookie 'accessToken'.
 */
function cookieExtractor(req: Request): string | null {
  if (req && req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
}

/**
 * JWT Strategy
 * ----------------------------------------------------------------------------
 * Authenticates requests based on a JWT token in de HttpOnly cookie.
 * Het payload object bevat { id: string } met de user ID.
 */
const jwtOpts: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET || 'changeme',
};

passport.use(
  new JwtStrategy(jwtOpts, async (payload: any, done: VerifiedCallback) => {
    try {
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
