import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import {
  Request,
  Response,
  NextFunction,
  CookieOptions,
} from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import { AuthenticatedUser } from '../config/passport-strategies';
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

const prisma = new PrismaClient();

/* ------------------------------------------------------------------ */
/* 1. REGISTER                                                         */
/* ------------------------------------------------------------------ */
interface RegisterRequestBody {
  email?: string;
  password?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      dateOfBirth,
    } = req.body as RegisterRequestBody;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required fields.' });
      return;
    }
    if (!firstName || !lastName || !dateOfBirth) {
      res.status(400).json({
        error: 'First name, last name, and date of birth are required fields.',
      });
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

    const newUser = await createUser({ email, password, role, personId });

    res.status(201).json({
      message: 'Registration successful.',
      user: {
        personId: newUser.personId,
        email: newUser.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/* 2. LOGIN – web cookies + mobile Bearer                              */
/* ------------------------------------------------------------------ */
interface LoginRequestBody {
  email?: string;
  password?: string;
  platform?: 'web' | 'mobile' | 'web-persist';
}

export function login(req: Request, res: Response, next: NextFunction): void {
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

        /* ---------------- mobile / FMX ---------------- */
        if (platform === 'mobile') {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          await storeRefreshToken(user.personId, tokens.refreshToken, expiresAt);

          res.status(200).json({
            message: 'Login successful.',
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            authenticatedUser: user,
          });
          return;
        }

        /* ---------------- web & web-persist ---------------- */
        const isProd = process.env.NODE_ENV === 'production';
        const cookieOptions: CookieOptions = {
          httpOnly: true,
          secure: isProd,
          sameSite: 'strict',
        };

        const refreshExpireDays = platform === 'web-persist' ? 30 : 7;
        cookieOptions.expires = new Date(
          Date.now() + refreshExpireDays * 86_400_000,
        );

        await storeRefreshToken(
          user.personId,
          tokens.refreshToken,
          cookieOptions.expires!,
        );

        res
          .cookie('accessToken', tokens.accessToken, cookieOptions)
          .cookie('refreshToken', tokens.refreshToken, cookieOptions)
          .status(200)
          .json({
            message: 'Login successful.',
            authenticatedUser: user,
          });
      } catch (e) {
        next(e);
      }
    },
  )(req, res, next);
}

/* ------------------------------------------------------------------ */
/* 3. REFRESH TOKEN                                                    */
/* ------------------------------------------------------------------ */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const suppliedToken: string | undefined =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      (req.headers['x-refresh-token'] as string | undefined);

    if (!suppliedToken) {
      res.status(400).json({ error: 'No refresh token supplied.' });
      return;
    }

    let payload: any;
    try {
      payload = jwt.verify(
        suppliedToken,
        process.env.JWT_SECRET || 'changeme',
      );
    } catch {
      res.status(401).json({ error: 'Invalid or expired refresh token.' });
      return;
    }

    const existing = await findRefreshToken(suppliedToken);
    if (!existing) {
      res
        .status(404)
        .json({ error: 'Refresh token not found or already invalidated.' });
      return;
    }
    if (existing.expiresAt < new Date()) {
      await removeRefreshToken(suppliedToken);
      res.status(401).json({ error: 'Refresh token is expired.' });
      return;
    }

    // Get user data for the authenticatedUser response
    const user = await findById(payload.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    
    const authenticatedUser: AuthenticatedUser = {
      personId: user.personId,
      firstName: user.person.firstName,
      lastName: user.person.lastName,
      dateOfBirth: user.person.dateOfBirth,
      email: user.email,
      roles: user.roles
    };

    await removeRefreshToken(suppliedToken);

    const { platform = 'web' } = req.body as { platform?: string };
    const newTokens = generateTokens({ personId: payload.id } as any, platform);

    /* ---------------- mobile / FMX ---------------- */
    if (platform === 'mobile') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await storeRefreshToken(payload.id, newTokens.refreshToken, expiresAt);

      res.status(200).json({
        message: 'Tokens successfully renewed.',
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        authenticatedUser
      });
      return;
    }

    /* ---------------- web ---------------- */
    const isProd = process.env.NODE_ENV === 'production';
    const refreshExpireDays = platform === 'web-persist' ? 30 : 7;
    const refreshExpires = new Date(Date.now() + refreshExpireDays * 86_400_000);

    await storeRefreshToken(payload.id, newTokens.refreshToken, refreshExpires);

    res
      .cookie('accessToken', newTokens.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
      })
      .cookie('refreshToken', newTokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        expires: refreshExpires,
      })
      .status(200)
      .json({ 
        message: 'Tokens successfully renewed.',
        authenticatedUser
      });
  } catch (e) {
    next(e);
  }
}

/* ------------------------------------------------------------------ */
/* 4. FORGOT PASSWORD                                                  */
/* ------------------------------------------------------------------ */
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
  } catch (e) {
    next(e);
  }
}

/* ------------------------------------------------------------------ */
/* 5. RESET PASSWORD                                                   */
/* ------------------------------------------------------------------ */
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
    await storeResetToken(user.personId, '', new Date(0));

    res
      .status(200)
      .json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (e) {
    next(e);
  }
}

/* ------------------------------------------------------------------ */
/* 6. CHANGE PASSWORD                                                  */
/* ------------------------------------------------------------------ */
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
  } catch (e) {
    next(e);
  }
}

/* ------------------------------------------------------------------ */
/* 7. LOGOUT                                                           */
/* ------------------------------------------------------------------ */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token: string | undefined =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      (req.headers['x-refresh-token'] as string | undefined);

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

    if (token) {
      try {
        await removeRefreshToken(token);
      } catch (err: any) {
        if (err.code !== 'P2025') throw err;
      }
    }

    res.status(200).json({ message: 'Logout successful.' });
  } catch (e) {
    next(e);
  }
}
