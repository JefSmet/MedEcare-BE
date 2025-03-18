/**
 * @description
 * The Auth Controller file contains controller functions for handling
 * authentication-related endpoints such as user registration, login,
 * token refresh, password reset, etc.
 *
 * Key features:
 * - register: Validates input, checks password strength, creates user in the DB.
 * - login: Authenticates a user via Passport's local strategy, returns JWT tokens.
 * - refreshToken: Validates an existing refresh token, issues a new access/refresh pair.
 * - forgotPassword: Generates a reset token, stores it, sends email via SendGrid.
 * - resetPassword: Verifies the token, sets a new password if valid, clears the token.
 * - changePassword: Allows an authenticated user to change their password.
 * - logout: Invalidates a user's refresh token so it can no longer be used.
 *
 * @dependencies
 * - express: for Request, Response, NextFunction types.
 * - passport: used to authenticate the user in the login method.
 * - user-service: used in registration, password updates, etc.
 * - token-utils: for generating access and refresh tokens with different expiration times.
 * - password-validator: for validating password strength requirements.
 * - auth-service: for storing and retrieving refresh/reset tokens from DB.
 * - email-service: for sending the password reset emails via SendGrid.
 *
 * @notes
 * - The `login()` method relies on `passport.authenticate('local')` to verify credentials.
 * - The `forgotPassword()` method initiates the reset process by sending an email.
 * - The `resetPassword()` method completes the reset process.
 * - The `changePassword()` method requires an existing login session (JWT-based).
 * - The `logout()` method invalidates a specific refresh token, or returns success if none is found.
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

/**
 * Interface describing the expected shape of the request body
 * for user registration.
 */
interface RegisterRequestBody {
  email?: string;
  password?: string;
  role?: string;
}

/**
 * @function register
 * @description Handles user registration.
 *  1. Validates incoming email and password fields.
 *  2. Checks password strength using password-validator.ts.
 *  3. Calls userService.createUser to persist the user in the database.
 *  4. Returns a JSON response confirming success or reporting errors.
 *
 * @param {Request} req - The Express Request object
 * @param {Response} res - The Express Response object
 * @param {NextFunction} next - The Express NextFunction for error handling
 *
 * @returns {Promise<void>} - No return value; the result is sent as HTTP response
 *
 * @example
 *  POST /auth/register
 *  {
 *    "email": "test@example.com",
 *    "password": "StrongPass#1"
 *  }
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password, role } = req.body as RegisterRequestBody;

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

    const newUser = await createUser({ email, password, role });

    res.status(201).json({
      message: 'Registratie succesvol.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * Interface describing the expected shape of the request body
 * for user login.
 */
interface LoginRequestBody {
  email?: string;
  password?: string;
  platform?: 'web' | 'mobile'; // Defaults to 'web' if not specified
}

/**
 * @function login
 * @description Handles user login via Passport local strategy.
 *  1. Uses passport.authenticate('local') to validate credentials.
 *  2. If valid, generates access & refresh tokens with different expirations
 *     based on platform (web or mobile).
 *  3. Stores the refresh token in the database.
 *  4. Responds with tokens in JSON format.
 *
 * @param {Request} req - The Express Request object
 * @param {Response} res - The Express Response object
 * @param {NextFunction} next - The Express NextFunction for error handling
 *
 * @returns {void} - The result is sent as an HTTP response
 *
 * @example
 *  POST /auth/login
 *  {
 *    "email": "test@example.com",
 *    "password": "StrongPass#1",
 *    "platform": "mobile"
 *  }
 */
export function login(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('local', async (err: any, user: any, info: any): Promise<void> => {
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
      // 1. Generate Access & Refresh Tokens
      const tokens = generateTokens(user, platform);

      // 2. Determine refresh token expiration date (7 dagen voor web, 30 dagen voor mobile)
      const refreshExpireDays = platform === 'mobile' ? 30 : 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + refreshExpireDays);

      // 3. Store the refresh token in the DB
      await storeRefreshToken(user.id, tokens.refreshToken, expiresAt);

      // 4. Return tokens to the client
      res.status(200).json({
        message: 'Login succesvol.',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        tokens,
      });
      return;
    } catch (tokenError) {
      next(tokenError);
      return;
    }
  })(req, res, next);
}

/**
 * Interface describing the expected shape of the request body
 * for refreshing tokens.
 */
interface RefreshTokenRequestBody {
  refreshToken?: string; // The JWT-based refresh token
  platform?: 'web' | 'mobile'; // The client platform
}

/**
 * @function refreshToken
 * @description Handles the refresh token workflow.
 *  1. Extracts the existing refresh token from request body.
 *  2. Validates the token signature using jwt.verify().
 *  3. Looks up the stored refresh token in the DB to ensure it’s still valid and not expired.
 *  4. If valid, removes the old refresh token (single-use logic).
 *  5. Issues a new pair of tokens (access + refresh) with updated expiration.
 *  6. Stores the new refresh token in the DB and returns them to the client.
 *
 * @param {Request} req - The Express Request object
 * @param {Response} res - The Express Response object
 * @param {NextFunction} next - The Express NextFunction for error handling
 *
 * @returns {Promise<void>} - The result is sent as an HTTP response
 *
 * @example
 *  POST /auth/refresh
 *  {
 *    "refreshToken": "<existing refresh token>",
 *    "platform": "web"
 *  }
 */
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
    let payload: any = null;

    try {
      // Verify the refresh token's signature and decode
      payload = jwt.verify(refreshToken, secret);
    } catch (verifyError) {
      res.status(401).json({ error: 'Invalid or expired refresh token.' });
      return;
    }

    // Zoek de refresh token in de DB
    const existingRefresh = await findRefreshToken(refreshToken);
    if (!existingRefresh) {
      res
        .status(404)
        .json({ error: 'Refresh token not found or already invalidated.' });
      return;
    }

    // Check if the refresh token is expired according to DB
    if (existingRefresh.expiresAt < new Date()) {
      await removeRefreshToken(refreshToken);
      res.status(401).json({ error: 'Refresh token has expired.' });
      return;
    }

    // Remove the old refresh token (single-use)
    await removeRefreshToken(refreshToken);

    // Extract userId from the token payload (assuming payload.id is set)
    const userId = payload.id;

    // Generate new tokens
    const newTokens = generateTokens({ id: userId } as any, platform);

    // Calculate new expiration date for the refresh token
    const refreshExpireDays = platform === 'mobile' ? 30 : 7;
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + refreshExpireDays);

    // Store the new refresh token in the DB
    await storeRefreshToken(userId, newTokens.refreshToken, newExpiresAt);

    // Send the new tokens to the client
    res.status(200).json({
      message: 'Tokens refreshed successfully.',
      tokens: newTokens,
    });
    return;
  } catch (error: any) {
    next(error);
  }
}

/**
 * Interface describing the expected shape of the request body
 * for forgotten password request.
 */
interface ForgotPasswordRequestBody {
  email?: string;
}

/**
 * @function forgotPassword
 * @description Handles the request to generate and send a password reset email.
 *  1. Looks up the user by the provided email.
 *  2. If found, generates a random token and sets an expiration (e.g., 1 hour).
 *  3. Stores the token & expiration in the DB (User.resetToken, User.resetExpire).
 *  4. Sends a password reset email to the user via SendGrid.
 *  5. Returns a 200 response indicating success (or 404 if user not found).
 *
 * @param {Request} req - The Express Request object
 * @param {Response} res - The Express Response object
 * @param {NextFunction} next - The Express NextFunction for error handling
 *
 * @returns {Promise<void>} - The result is sent as HTTP response
 *
 * @example
 *  POST /auth/forgot-password
 *  {
 *    "email": "test@example.com"
 *  }
 */
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

    // 1. Lookup the user by email
    const user = await findByEmail(email);
    if (!user) {
      res
        .status(404)
        .json({ error: 'No user found with the given email address.' });
      return;
    }

    // 2. Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 3. Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // 4. Store the token & expiration in DB
    await storeResetToken(user.id, resetToken, expiresAt);

    // 5. Construct the reset link (replace with your front-end or actual route)
    const resetLink = `https://your-frontend-app.com/reset-password?token=${resetToken}`;

    // 6. Send the reset email
    await sendResetEmail(user.email, resetLink);

    // 7. Return success
    res.status(200).json({
      message:
        'Reset instructions sent to the provided email address (if valid).',
    });
    return;
  } catch (error: any) {
    next(error);
  }
}

/**
 * Interface describing the expected shape of the request body
 * for the resetPassword endpoint.
 */
interface ResetPasswordRequestBody {
  token?: string;
  newPassword?: string;
}

/**
 * @function resetPassword
 * @description Handles the final step of password reset:
 *  1. Validates the incoming request for reset token and new password.
 *  2. Finds the corresponding user based on the reset token.
 *  3. Checks if the token is still valid (not expired).
 *  4. Validates new password strength.
 *  5. Updates the user's password and clears the reset token fields.
 *
 * @param {Request} req - The Express Request object
 * @param {Response} res - The Express Response object
 * @param {NextFunction} next - The Express NextFunction for error handling
 *
 * @returns {Promise<void>} - The result is sent as an HTTP response
 *
 * @example
 *  POST /auth/reset-password
 *  {
 *    "token": "abc123random",
 *    "newPassword": "StrongNewPass!1"
 *  }
 */
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

    // 2. Locate the user by reset token
    const user = await findByResetToken(token);
    if (!user) {
      res.status(404).json({ error: 'Invalid or unknown reset token.' });
      return;
    }

    // 3. Check if the token is expired
    if (!user.resetExpire || user.resetExpire < new Date()) {
      res.status(400).json({
        error: 'This reset token has expired. Please request a new one.',
      });
      return;
    }

    // 4. Validate the new password
    if (!isPasswordValid(newPassword)) {
      res.status(400).json({
        error: 'New password does not meet the required strength policy.',
      });
      return;
    }

    // 5. Update the password and clear the reset fields
    await updatePassword(user.id, newPassword);
    await storeResetToken(user.id, '', new Date(0)); // effectively empties the token

    res.status(200).json({
      message: 'Password has been reset successfully. You can now log in.',
    });
    return;
  } catch (error: any) {
    next(error);
  }
}

/**
 * Interface describing the request body for the changePassword endpoint.
 */
interface ChangePasswordRequestBody {
  oldPassword?: string;
  newPassword?: string;
}

/**
 * @function changePassword
 * @description Allows an authenticated user to change their password by providing their old password.
 *  1. Requires JWT authentication (user must be logged in).
 *  2. Compares the supplied old password with the user's hashed password in the DB.
 *  3. Validates the strength of the new password.
 *  4. If all checks pass, updates the user's password in the database.
 *
 * @param {Request} req - The Express Request object; must have req.user populated by JWT middleware.
 * @param {Response} res - The Express Response object
 * @param {NextFunction} next - The Express NextFunction for error handling
 *
 * @returns {Promise<void>} - The result is sent as an HTTP response
 *
 * @example
 *  POST /auth/change-password
 *  Headers: { Authorization: "Bearer <accessToken>" }
 *  {
 *    "oldPassword": "OldPass123!",
 *    "newPassword": "NewStrongPass#1"
 *  }
 */
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
      res.status(400).json({ error: 'New password does not meet strength requirements.' });
      return;
    }

    await updatePassword(dbUser.id, newPassword);

    res.status(200).json({
      message: 'Password changed successfully.',
    });
    return;
  } catch (error: any) {
    next(error);
  }
}

/**
 * Interface describing the expected shape of the request body
 * for the logout endpoint.
 */
interface LogoutRequestBody {
  refreshToken?: string;
}

/**
 * @function logout
 * @description Invalidates a user's refresh token so it can no longer be used to refresh access tokens.
 *  1. Reads the refresh token from the request body (or headers, if you prefer).
 *  2. If token is provided, removes it from the DB (if it exists).
 *  3. Returns a success response regardless (idempotent behavior).
 *
 * @param {Request} req - The Express Request object
 * @param {Response} res - The Express Response object
 * @param {NextFunction} next - The Express NextFunction for error handling
 *
 * @returns {Promise<void>} - The result is sent as HTTP response
 *
 * @example
 *  POST /auth/logout
 *  {
 *    "refreshToken": "the_refresh_token_here"
 *  }
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body as LogoutRequestBody;

    // If no token is provided, simply return success (idempotent)
    if (!refreshToken) {
      res.status(200).json({
        message: 'Logout successful (no token provided).',
      });
      return;
    }

    // Attempt to remove the token from the DB
    try {
      await removeRefreshToken(refreshToken);
      res.status(200).json({
        message: 'Logout successful. Refresh token invalidated.',
      });
      return;
    } catch (removeError: any) {
      if (removeError.code === 'P2025') {
        res.status(200).json({
          message: 'Logout successful. Token was not found in DB.',
        });
        return;
      }
      throw removeError;
    }
  } catch (error: any) {
    next(error);
  }
}
