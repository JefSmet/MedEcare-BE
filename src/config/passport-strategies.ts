import { PrismaClient, User, Person, UserRole, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {
  Strategy as JwtStrategy,
  StrategyOptions,
  VerifiedCallback,
} from 'passport-jwt';
import { Request } from 'express';

/**
 * 1) AuthenticatedUser interface (our own “DTO” for the logged-in user)
 */
export interface AuthenticatedUser {
  personId: string;
  email: string;
  roles: string[];
  firstName: string;
  lastName: string;
  dateOfBirth: Date; // Added
}

/**
 * 2) Helper function to map from a Prisma user to AuthenticatedUser
 */
function toAuthenticatedUser(
  dbUser: User & {
    person: Person;
    userRoles: (UserRole & { role: Role })[];
  },
): AuthenticatedUser {
  return {
    personId: dbUser.personId,
    email: dbUser.email,
    roles: dbUser.userRoles.map((ur) => ur.role.name),
    firstName: dbUser.person.firstName,
    lastName: dbUser.person.lastName,
    dateOfBirth: dbUser.person.dateOfBirth,
  };
}

const prisma = new PrismaClient();

/**
 * A) Local Strategy
 */
const localOpts = {
  usernameField: 'email',
  passwordField: 'password',
};

passport.use(
  new LocalStrategy(localOpts, async (email, password, done) => {
    try {
      // Fetch the user including person and roles from the DB
      const dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
          person: true,
          userRoles: { include: { role: true } },
        },
      });
      if (!dbUser) {
        return done(null, false, { message: 'Invalid credentials (user not found).' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, dbUser.password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid credentials (password mismatch).' });
      }

      // Map to AuthenticatedUser
      const authUser = toAuthenticatedUser(dbUser);
      return done(null, authUser);
    } catch (err) {
      return done(err);
    }
  }),
);

/**
 * B) Cookie extractor for the JWT
 */
function cookieExtractor(req: Request): string | null {
  if (req && req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
}

/**
 * C) JWT Strategy
 */
const jwtOpts: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET || 'changeme',
};

passport.use(
  new JwtStrategy(jwtOpts, async (payload: any, done: VerifiedCallback) => {
    try {
      // Find by personId in payload
      const dbUser = await prisma.user.findUnique({
        where: { personId: payload.id },
        include: {
          person: true,
          userRoles: { include: { role: true } },
        },
      });
      if (!dbUser) {
        return done(null, false, { message: 'Token invalid (no user)' });
      }

      const authUser = toAuthenticatedUser(dbUser);
      return done(null, authUser);
    } catch (error) {
      return done(error, false);
    }
  }),
);

/**
 * D) initPassportStrategies() (optional)
 */
export function initPassportStrategies(): void {
  // no-op
}
