/**
 * @description
 * The Auth Controller file contains controller functions for handling
 * authentication-related endpoints such as user registration, login,
 * password reset, etc.
 *
 * Key features:
 * - register: Validates input, checks password strength, creates user in the DB.
 * - login: Authenticates a user via Passport's local strategy, returns JWT tokens.
 *
 * @dependencies
 * - express: for Request, Response, NextFunction types.
 * - passport: used to authenticate the user in the login method.
 * - user-service: used in registration; also helpful for advanced user lookups if needed.
 * - token-utils: for generating access and refresh tokens with different expiration times.
 * - password-validator: for validating password strength requirements on registration.
 *
 * @notes
 * - Additional methods (password reset, logout, etc.) will be added in future steps.
 * - The `login()` method relies on `passport.authenticate('local')` to verify credentials.
 */

import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

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
 *  2. If valid, generates access & refresh tokens with different expirations based on platform (web or mobile).
 *  3. Responds with tokens in JSON format.
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
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Als de gebruiker niet gevonden wordt of als het wachtwoord niet overeenkomt
      return res
        .status(401)
        .json({ error: info?.message || 'Invalid credentials.' });
    }

    // Indien succesvol, genereer tokens
    try {
      const { platform = 'web' } = req.body as LoginRequestBody;
      const tokens = generateTokens(user, platform);
      return res.status(200).json({
        message: 'Login succesvol.',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        tokens,
      });
    } catch (tokenError) {
      return next(tokenError);
    }
  })(req, res, next);
}
