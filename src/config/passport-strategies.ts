import { PrismaClient, User, Person, UserRole, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
  VerifiedCallback,
} from 'passport-jwt';
import { Request } from 'express';

/* ------------------------------------------------------------------ */
/* 1. AuthenticatedUser DTO                                            */
/* ------------------------------------------------------------------ */
export interface AuthenticatedUser {
  personId: string;
  email: string;
  roles: string[];
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
}

/* ------------------------------------------------------------------ */
/* 2. Helper – Prisma-record ➜ DTO                                     */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* 3. Local Strategy                                                   */
/* ------------------------------------------------------------------ */
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          include: {
            person: true,
            userRoles: { include: { role: true } },
          },
        });
        if (!dbUser) {
          return done(null, false, { message: 'Invalid credentials (user).' });
        }

        const isMatch = await bcrypt.compare(password, dbUser.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials (password).' });
        }

        return done(null, toAuthenticatedUser(dbUser));
      } catch (err) {
        return done(err);
      }
    },
  ),
);

/* ------------------------------------------------------------------ */
/* 4. JWT Strategy – cookie OF Bearer                                  */
/* ------------------------------------------------------------------ */
function cookieExtractor(req: Request): string | null {
  return req.cookies?.accessToken ?? null;
}

const jwtOpts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(), // FMX/mobile
    cookieExtractor,                          // web
  ]),
  secretOrKey: process.env.JWT_SECRET || 'changeme',
};

passport.use(
  new JwtStrategy(jwtOpts, async (payload: any, done: VerifiedCallback) => {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { personId: payload.id },
        include: {
          person: true,
          userRoles: { include: { role: true } },
        },
      });
      if (!dbUser) {
        return done(null, false, { message: 'Token invalid (user).' });
      }
      return done(null, toAuthenticatedUser(dbUser));
    } catch (err) {
      return done(err, false);
    }
  }),
);

/* ------------------------------------------------------------------ */
/* 5. Optional init-export                                             */
/* ------------------------------------------------------------------ */
export function initPassportStrategies(): void {
  /* no-op – imported in app.ts */
}
