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
 *
 * @dependencies
 * - express: for Request, Response, NextFunction types.
 * - passport: used to authenticate the user in the login method.
 * - user-service: used in registration; also helpful for advanced user lookups if needed.
 * - token-utils: for generating access and refresh tokens with different expiration times.
 * - password-validator: for validating password strength requirements on registration.
 * - auth-service: for storing and retrieving refresh tokens from DB.
 *
 * @notes
 * - The `login()` method relies on `passport.authenticate('local')` to verify credentials.
 * - The `refreshToken()` method enforces a single-use refresh token strategy by removing used tokens.
 */

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import {
  findRefreshToken,
  removeRefreshToken,
  storeRefreshToken,
} from '../services/auth-service';
import { createUser } from '../services/user-service';
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
 *  3. Stores the refresh token in the database (single or multi-device approach).
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
  passport.authenticate('local', async (err: any, user: any, info: any) => {
    if (err) {
      next(err);
      return;
    }
    if (!user) {
      // Als de gebruiker niet gevonden wordt of als het wachtwoord niet overeenkomt
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
      // If signature invalid of token verlopen
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

    // Check of de refresh token verlopen is volgens de DB
    if (existingRefresh.expiresAt < new Date()) {
      // Indien verlopen, verwijder de token
      await removeRefreshToken(refreshToken);
      res.status(401).json({ error: 'Refresh token has expired.' });
      return;
    }

    // Verwijder de oude refresh token (single-use)
    await removeRefreshToken(refreshToken);

    // Haal het userId uit de payload (hier gaan we ervan uit dat payload.id beschikbaar is)
    const userId = payload.id;

    // Genereer nieuwe tokens
    const newTokens = generateTokens({ id: userId } as any, platform);

    // Bereken de nieuwe vervaldatum voor de refresh token
    const refreshExpireDays = platform === 'mobile' ? 30 : 7;
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + refreshExpireDays);

    // Sla de nieuwe refresh token op in de DB
    await storeRefreshToken(userId, newTokens.refreshToken, newExpiresAt);

    // Verstuur de nieuwe tokens naar de client
    res.status(200).json({
      message: 'Tokens refreshed successfully.',
      tokens: newTokens,
    });
    return;
  } catch (error: any) {
    next(error);
  }
}
