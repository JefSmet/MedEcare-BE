/**
 * @description
 * The Auth Controller file handles authentication-related endpoints such as
 * user registration, login, token refresh, password reset, etc.
 *
 * Key features:
 * - register: Validates input, checks password strength, creates user in DB (including Person link & role).
 * - login: Authenticates a user, returns JWT tokens.
 * - refreshToken: Exchanges refresh tokens for new ones.
 * - forgotPassword: Generates reset token, stores it, sends email.
 * - resetPassword: Verifies reset token, updates password.
 * - changePassword: Authenticated user changes their password.
 * - logout: Invalidates a refresh token.
 *
 * @notes
 * - The user schema is now 1:1 with Person and M:N with Role. We flatten the roles
 *   in the Passport strategies, so user.roles is an array.
 */

import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';

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
  findByResetToken,
  updatePassword,
  findById,
} from '../services/user-service';
import { isPasswordValid } from '../utils/password-validator';
import { generateTokens } from '../utils/token-utils';

interface RegisterRequestBody {
  email?: string;
  password?: string;
  role?: string;
  personId?: string; 
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password, role, personId } = req.body as RegisterRequestBody;

    if (!email || !password) {
      res.status(400).json({
        error: 'Email en wachtwoord zijn verplichte velden.',
      });
      return;
    }

    if (!isPasswordValid(password)) {
      res.status(400).json({
        error: 'Wachtwoord voldoet niet aan het vereiste sterktebeleid.',
      });
      return;
    }

    // createUser will handle linking the Person and attaching role
    const newUser = await createUser({ email, password, role, personId });

    res.status(201).json({
      message: 'Registratie succesvol.',
      user: {
        id: newUser.id,
        email: newUser.email,
        personId: newUser.personId,
        // We do not return roles array here, but you can if you want:
        // roles: newUserRoles
      },
    });
  } catch (error: any) {
    next(error);
  }
}

interface LoginRequestBody {
  email?: string;
  password?: string;
  platform?: 'web' | 'mobile';
}

export function login(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('local', async (err: any, user: any, info: any) => {
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
      const tokens = generateTokens(user, platform);

      const refreshExpireDays = platform === 'mobile' ? 30 : 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + refreshExpireDays);

      await storeRefreshToken(user.id, tokens.refreshToken, expiresAt);

      res.status(200).json({
        message: 'Login succesvol.',
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles, // Flattened roles array
          personId: user.personId,
        },
        tokens,
      });
    } catch (tokenError) {
      next(tokenError);
    }
  })(req, res, next);
}

interface RefreshTokenRequestBody {
  refreshToken?: string;
  platform?: 'web' | 'mobile';
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken, platform = 'web' } =
      req.body as RefreshTokenRequestBody;

    if (!refreshToken) {
      res.status(400).json({ error: 'Missing refreshToken field.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'changeme';
    let payload: any;

    try {
      payload = jwt.verify(refreshToken, secret);
    } catch (verifyError) {
      res.status(401).json({ error: 'Invalid or expired refresh token.' });
      return;
    }

    const existingRefresh = await findRefreshToken(refreshToken);
    if (!existingRefresh) {
      res
        .status(404)
        .json({ error: 'Refresh token not found or already invalidated.' });
      return;
    }

    if (existingRefresh.expiresAt < new Date()) {
      await removeRefreshToken(refreshToken);
      res.status(401).json({ error: 'Refresh token has expired.' });
      return;
    }

    await removeRefreshToken(refreshToken);

    const userId = payload.id;
    const newTokens = generateTokens({ id: userId } as any, platform);
    const refreshExpireDays = platform === 'mobile' ? 30 : 7;
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + refreshExpireDays);

    await storeRefreshToken(userId, newTokens.refreshToken, newExpiresAt);

    res.status(200).json({
      message: 'Tokens refreshed successfully.',
      tokens: newTokens,
    });
  } catch (error: any) {
    next(error);
  }
}

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
        .json({ error: 'Email is required to request password reset.' });
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

    await storeResetToken(user.id, resetToken, expiresAt);

    const resetLink = `https://your-frontend-app.com/reset-password?token=${resetToken}`;
    await sendResetEmail(user.email, resetLink);

    res.status(200).json({
      message:
        'Reset instructions sent to the provided email address (if valid).',
    });
  } catch (error: any) {
    next(error);
  }
}

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
        error:
          'Both "token" and "newPassword" fields are required to reset the password.',
      });
      return;
    }

    const user = await findByResetToken(token);
    if (!user) {
      res.status(404).json({ error: 'Invalid or unknown reset token.' });
      return;
    }

    if (!user.resetExpire || user.resetExpire < new Date()) {
      res.status(400).json({
        error: 'This reset token has expired. Please request a new one.',
      });
      return;
    }

    if (!isPasswordValid(newPassword)) {
      res.status(400).json({
        error: 'New password does not meet the required strength policy.',
      });
      return;
    }

    await updatePassword(user.id, newPassword);
    await storeResetToken(user.id, '', new Date(0));

    res.status(200).json({
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error: any) {
    next(error);
  }
}

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
    const userFromJwt = req.user as { id: string } | undefined;
    if (!userFromJwt || !userFromJwt.id) {
      res.status(401).json({ error: 'Unauthorized or invalid token.' });
      return;
    }

    const { oldPassword, newPassword } = req.body as ChangePasswordRequestBody;
    if (!oldPassword || !newPassword) {
      res.status(400).json({
        error: 'Both "oldPassword" and "newPassword" fields are required.',
      });
      return;
    }

    const dbUser = await findById(userFromJwt.id);
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
        .json({ error: 'New password does not meet strength requirements.' });
      return;
    }

    await updatePassword(dbUser.id, newPassword);

    res.status(200).json({
      message: 'Password changed successfully.',
    });
  } catch (error: any) {
    next(error);
  }
}

interface LogoutRequestBody {
  refreshToken?: string;
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body as LogoutRequestBody;

    if (!refreshToken) {
      res.status(200).json({
        message: 'Logout successful (no token provided).',
      });
      return;
    }

    try {
      await removeRefreshToken(refreshToken);
      res.status(200).json({
        message: 'Logout successful. Refresh token invalidated.',
      });
    } catch (removeError: any) {
      if (removeError.code === 'P2025') {
        res.status(200).json({
          message: 'Logout successful. Token was not found in DB.',
        });
      } else {
        throw removeError;
      }
    }
  } catch (error: any) {
    next(error);
  }
}

