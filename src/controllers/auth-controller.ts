import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';

// Import the AuthenticatedUser interface here
import { AuthenticatedUser } from '../config/passport-strategies';

const prisma = new PrismaClient();

import {
  findRefreshToken,
  removeRefreshToken,
  storeRefreshToken,
  storeResetToken,
} from '../services/auth-service';
import { sendResetEmail } from '../services/email-service';
import {
  createUser,
  findByEmail,
  findById,
  findByResetToken,
  updatePassword,
} from '../services/user-service';
import { isPasswordValid } from '../utils/password-validator';
import { generateTokens } from '../utils/token-utils';

interface RegisterRequestBody {
  email?: string;
  password?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

/**
 * Registration endpoint
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password, role, firstName, lastName, dateOfBirth } =
      req.body as RegisterRequestBody;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required fields.' });
      return;
    }
    if (!firstName || !lastName || !dateOfBirth) {
      res
        .status(400)
        .json({ error: 'First name, last name, and date of birth are required fields.' });
      return;
    }
    if (!isPasswordValid(password)) {
      res
        .status(400)
        .json({ error: 'Password does not meet the required strength policy.' });
      return;
    }

    const parsedDate = new Date(dateOfBirth);
    if (isNaN(parsedDate.getTime())) {
      res
        .status(400)
        .json({ error: 'Date of birth must be a valid date format (YYYY-MM-DD).' });
      return;
    }

    // Check for existing person or create one
    const existingPerson = await prisma.person.findFirst({
      where: { firstName, lastName, dateOfBirth: parsedDate },
    });

    let personId: string;
    if (existingPerson) {
      personId = existingPerson.id;
    } else {
      const newPerson = await prisma.person.create({
        data: { firstName, lastName, dateOfBirth: parsedDate },
      });
      personId = newPerson.id;
    }

    // Create the user
    const newUser = await createUser({ email, password, role, personId });

    res.status(201).json({
      message: 'Registration successful.',
      user: {
        personId: newUser.personId,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    next(error);
  }
}

interface LoginRequestBody {
  email?: string;
  password?: string;
  platform?: 'web' | 'mobile' | 'web-persist';
}

/**
 * Login endpoint
 */
export function login(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  passport.authenticate(
    'local',
    async (err: any, user: AuthenticatedUser, info: any) => {
      if (err) {
        next(err);
        return;
      }
      if (!user) {
        res.status(401).json({ error: info?.message || 'Invalid credentials.' });
        return;
      }

      try {
        const { platform = 'web' } = req.body as LoginRequestBody;
        const tokens = generateTokens({ personId: user.personId } as any, platform);

        // Determine refresh token expiration
        let refreshExpireDays = platform === 'web' ? 7 : 30;
        if (platform === 'web-persist') refreshExpireDays = 30;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshExpireDays);

        await storeRefreshToken(user.personId, tokens.refreshToken, expiresAt);

        // Cookies
        const isProd = process.env.NODE_ENV === 'production';
        const cookieOptions: CookieOptions = {
          httpOnly: true,
          secure: isProd,
          sameSite: 'strict',
        };
        if (platform === 'web-persist') {
          cookieOptions.maxAge = refreshExpireDays * 24 * 60 * 60 * 1000;
        }

        res.cookie('accessToken', tokens.accessToken, cookieOptions);
        res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

        res.status(200).json({
          message: 'Login successful.',
          authenticatedUser: {
            personId: user.personId,
            email: user.email,
            roles: user.roles,
            firstName: user.firstName,
            lastName: user.lastName,
            dateOfBirth: user.dateOfBirth,
          },
        });
      } catch (tokenError) {
        next(tokenError);
      }
    },
  )(req, res, next);
}

/**
 * Refresh-token endpoint
 */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cookie = req.cookies?.refreshToken;
    if (!cookie) {
      res.status(400).json({ error: 'No refreshToken cookie present.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'changeme';
    let payload: any;
    try {
      payload = jwt.verify(cookie, secret);
    } catch {
      res.status(401).json({ error: 'Invalid or expired refresh token.' });
      return;
    }

    const existing = await findRefreshToken(cookie);
    if (!existing) {
      res
        .status(404)
        .json({ error: 'Refresh token not found or already invalidated.' });
      return;
    }
    if (existing.expiresAt < new Date()) {
      await removeRefreshToken(cookie);
      res.status(401).json({ error: 'Refresh token is expired.' });
      return;
    }

    await removeRefreshToken(cookie);

    const userId = payload.id as string;
    const { platform = 'web' } = req.body as { platform?: string };

    const dbUser = await findById(userId);
    if (!dbUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const newTokens = generateTokens({ personId: userId } as any, platform);
    let refreshExpireDays = platform === 'web' ? 7 : 30;
    if (platform === 'web-persist') refreshExpireDays = 30;

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + refreshExpireDays);

    await storeRefreshToken(userId, newTokens.refreshToken, newExpiresAt);

    const isProd = process.env.NODE_ENV === 'production';
    const accessMaxAge =
      parseInt((process.env.ACCESS_TOKEN_EXPIRY_WEB || '1h').replace('h', ''), 10) *60*
        60 *
        1000 || 3600000;

    res.cookie('accessToken', newTokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: accessMaxAge,
    });
    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      expires: newExpiresAt,
    });

    // Build AuthenticatedUser for the response
    const authenticatedUser: AuthenticatedUser = {
      personId: dbUser.personId,
      email: dbUser.email,
      roles: dbUser.roles,
      firstName: dbUser.person.firstName,
      lastName: dbUser.person.lastName,
      dateOfBirth: dbUser.person.dateOfBirth,
    };

    res.status(200).json({
      message: 'Tokens successfully renewed.',
      authenticatedUser,
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * Forgot-password endpoint
 */
interface ForgotPasswordRequestBody {
  email?: string;
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email } = req.body as ForgotPasswordRequestBody;
    if (!email) {
      res
        .status(400)
        .json({ error: 'Email is required to request a password reset.' });
      return;
    }
    const user = await findByEmail(email);
    if (!user) {
      res
        .status(404)
        .json({ error: 'No user found with the given email address.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await storeResetToken(user.personId, resetToken, expiresAt);

    const resetLink =
      process.env.FRONTEND_ORIGIN +
      `/MedEcareWC/MedEcare.html?resetToken=${resetToken}`;
    await sendResetEmail(user.email, resetLink);

    res.status(200).json({
      message:
        'Reset instructions have been sent to the provided email address (if valid).',
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * Reset-password endpoint
 */
interface ResetPasswordRequestBody {
  token?: string;
  newPassword?: string;
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token, newPassword } = req.body as ResetPasswordRequestBody;
    if (!token || !newPassword) {
      res.status(400).json({
        error: 'Both "token" and "newPassword" fields are required.',
      });
      return;
    }
    const user = await findByResetToken(token);
    if (!user) {
      res.status(404).json({ error: 'Invalid or unknown reset token.' });
      return;
    }
    if (!user.resetExpire || user.resetExpire < new Date()) {
      res
        .status(400)
        .json({ error: 'This reset token has expired. Please request a new one.' });
      return;
    }
    if (!isPasswordValid(newPassword)) {
      res
        .status(400)
        .json({ error: 'New password does not meet the required strength policy.' });
      return;
    }
    await updatePassword(user.personId, newPassword);
    // Invalidate the token
    await storeResetToken(user.personId, '', new Date(0));

    res
      .status(200)
      .json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error: any) {
    next(error);
  }
}

/**
 * Change-password endpoint
 */
interface ChangePasswordRequestBody {
  oldPassword?: string;
  newPassword?: string;
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userFromJwt = req.user as AuthenticatedUser | undefined;
    if (!userFromJwt) {
      res.status(401).json({ error: 'Unauthorized or invalid token.' });
      return;
    }
    const { oldPassword, newPassword } = req.body as ChangePasswordRequestBody;
    if (!oldPassword || !newPassword) {
      res
        .status(400)
        .json({ error: 'Both oldPassword and newPassword are required.' });
      return;
    }

    const dbUser = await findById(userFromJwt.personId);
    if (!dbUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Old password is incorrect.' });
      return;
    }
    if (!isPasswordValid(newPassword)) {
      res
        .status(400)
        .json({ error: 'New password does not meet the required strength policy.' });
      return;
    }

    await updatePassword(dbUser.personId, newPassword);
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error: any) {
    next(error);
  }
}

/**
 * Logout endpoint
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cookie = req.cookies?.refreshToken;
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
    });
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
    });

    if (!cookie) {
      res.status(200).json({ message: 'Logout successful (no token present).' });
      return;
    }

    try {
      await removeRefreshToken(cookie);
      res.status(200).json({ message: 'Logout successful. Refresh token invalidated.' });
    } catch (removeError: any) {
      if (removeError.code === 'P2025') {
        res
          .status(200)
          .json({ message: 'Logout successful. Token was not found in the DB.' });
      } else {
        throw removeError;
      }
    }
  } catch (error: any) {
    next(error);
  }
}
