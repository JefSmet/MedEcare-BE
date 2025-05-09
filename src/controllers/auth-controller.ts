/**
 * @description
 * The Auth Controller handles authentication-related endpoints such as
 * user registration, login, token refresh, password reset, etc.
 *
 * Key changes:
 * - login: sets accessToken and refreshToken in HttpOnly cookies
 * - refreshToken: reads the refreshToken from the cookie, generates new tokens, and sets them again as cookies
 * - logout: clears the refreshToken and accessToken cookies
 *
 * @notes
 * - The JSON response generally contains a 'message' and optionally user info, but not the tokens themselves.
 * - Tokens are stored in the cookies for better security.
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';

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

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password, role, firstName, lastName, dateOfBirth } =
      req.body as RegisterRequestBody;

    if (!email || !password) {
      res.status(400).json({
        error: 'Email and password are required fields.',
      });
      return;
    }

    if (!firstName || !lastName || !dateOfBirth) {
      res.status(400).json({
        error: 'First name, last name, and date of birth are required fields.',
      });
      return;
    }

    if (!isPasswordValid(password)) {
      res.status(400).json({
        error: 'Password does not meet the required strength policy.',
      });
      return;
    }

    // Validate that dateOfBirth is a valid date
    const parsedDate = new Date(dateOfBirth);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({
        error: 'Date of birth must be a valid date format (YYYY-MM-DD).',
      });
      return;
    }

    // Check if a person with the same name and DOB already exists
    const existingPerson = await prisma.person.findFirst({
      where: {
        firstName,
        lastName,
        dateOfBirth: parsedDate,
      },
    });

    let personId: string;

    if (existingPerson) {
      personId = existingPerson.id;
    } else {
      const newPerson = await prisma.person.create({
        data: {
          firstName,
          lastName,
          dateOfBirth: parsedDate,
        },
      });
      personId = newPerson.id;
    }

    // Create user with the personId
    const newUser = await createUser({
      email,
      password,
      role,
      personId,
    });

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

      // Decide the refresh token expiry in days based on platform
      let refreshExpireDays: number;
      if (platform === 'mobile') {
        const envExpiry = process.env.REFRESH_TOKEN_EXPIRY_MOBILE || '30d';
        refreshExpireDays = parseInt(envExpiry.replace('d', ''), 10) || 30;
      } else if (platform === 'web-persist') {
        const envExpiry = process.env.REFRESH_TOKEN_EXPIRY_MOBILE || '30d';
        refreshExpireDays = parseInt(envExpiry.replace('d', ''), 10) || 30;
      } else {
        const envExpiry = process.env.REFRESH_TOKEN_EXPIRY_WEB || '7d';
        refreshExpireDays = parseInt(envExpiry.replace('d', ''), 10) || 7;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + refreshExpireDays);

      // Changed: user.id => user.
      await storeRefreshToken(user.personId, tokens.refreshToken, expiresAt);

      const isProd = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict' as const,
      };

      // For "web-persist", set a maxAge so the cookies remain after browser close
      if (platform === 'web-persist') {
        const maxAgeMs = refreshExpireDays * 24 * 60 * 60 * 1000;
        Object.assign(cookieOptions, { maxAge: maxAgeMs });
      }

      res.cookie('accessToken', tokens.accessToken, cookieOptions);
      res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

      res.status(200).json({
        message: 'Login successful.',
        user: {
          personId: user.personId,
          email: user.email,
          roles: user.roles,
          firstName: user.person.firstName,
          lastName: user.person.lastName,
        },
      });
    } catch (tokenError) {
      next(tokenError);
    }
  })(req, res, next);
}

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Uses the refresh token from cookies to issue new access and refresh tokens
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [web, mobile, web-persist]
 *                 default: web
 *     responses:
 *       200:
 *         description: Tokens successfully renewed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tokens successfully renewed.
 *                 user:
 *                   type: object
 *                   properties:
 *                     personId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: No refresh token cookie present
 *       401:
 *         description: Invalid or expired refresh token
 *       404:
 *         description: Refresh token not found or already invalidated
 */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(400).json({ error: 'No refreshToken cookie present.' });
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
      res.status(401).json({ error: 'Refresh token is expired.' });
      return;
    }

    // One-time use: remove old refresh token in DB
    await removeRefreshToken(refreshToken);

    const userId = payload.id;
    const { platform = 'web' } = req.body as {
      platform?: 'web' | 'mobile' | 'web-persist';
    };

    // Get user data to include in response
    const user = await findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // const person = await prisma.person.findUnique({
    //   where: { id: user.personId },
    // });
    // if (!person) {
    //   res.status(404).json({ error: 'Person not found.' });
    //   return;
    // }
    const newTokens = generateTokens({ personId: userId } as any, platform);

    // Decide refresh token expiry in days for new token
    let refreshExpireDays: number;
    if (platform === 'mobile') {
      const envExpiry = process.env.REFRESH_TOKEN_EXPIRY_MOBILE || '30d';
      refreshExpireDays = parseInt(envExpiry.replace('d', ''), 10) || 30;
    } else {
      const envExpiry = process.env.REFRESH_TOKEN_EXPIRY_WEB || '7d';
      refreshExpireDays = parseInt(envExpiry.replace('d', ''), 10) || 7;
    }

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + refreshExpireDays);

    await storeRefreshToken(userId, newTokens.refreshToken, newExpiresAt);

    let accessMaxAge: number;
    accessMaxAge =
      parseInt((process.env.ACCESS_TOKEN_EXPIRY || '1h').replace('h', ''), 10) *
      60 *
      1000; // Default to 1 hour if not set

    const isProd = process.env.NODE_ENV === 'production';
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

    res.status(200).json({
      message: 'Tokens successfully renewed.',
      user: {
        personId: user.personId,
        email: user.email,
        firstName: user.person.firstName,	
        lastName: user.person.lastName,
        // Use optional chaining and a fallback empty array to handle missing roles property
        roles: user.roles,
      },
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset email to the provided email address if a user with that email exists
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Reset instructions sent (returns 200 even if email doesn't exist for security)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset instructions have been sent to the provided email address (if valid).
 *       400:
 *         description: Missing email in request
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

    const resetLink = process.env.FRONTEND_ORIGIN+`/MedEcareWC/MedEcare.html?resetToken=${resetToken}`;
    await sendResetEmail(user.email, resetLink);

    res.status(200).json({
      message:
        'Reset instructions have been sent to the provided email address (if valid).',
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

    await updatePassword(user.personId, newPassword);
    await storeResetToken(user.personId, '', new Date(0));

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
    // Adjusted to read personId from req.user
    const userFromJwt = req.user as { personId: string } | undefined;
    if (!userFromJwt || !userFromJwt.personId) {
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
        .json({ error: 'New password does not meet strength requirements.' });
      return;
    }

    await updatePassword(dbUser.personId, newPassword);

    res.status(200).json({
      message: 'Password changed successfully.',
    });
  } catch (error: any) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

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

    if (!refreshToken) {
      res.status(200).json({
        message: 'Logout successful (no token present).',
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
        // Token did not exist in DB
        res.status(200).json({
          message: 'Logout successful. Token was not found in the DB.',
        });
      } else {
        throw removeError;
      }
    }
  } catch (error: any) {
    next(error);
  }
}
