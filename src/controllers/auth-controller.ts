/**
 * @description
 * The Auth Controller file contains controller functions for handling
 * authentication-related endpoints such as user registration, login,
 * password reset, etc.
 *
 * In this step, we are focusing on the user registration (POST /auth/register).
 *
 * Key features:
 * - register: Validates input, checks password strength, creates user in the DB.
 *
 * @dependencies
 * - express: for Request, Response, NextFunction types.
 * - user-service: to create a user in the database.
 * - password-validator: to validate password strength requirements.
 *
 * @notes
 * - Additional auth-related methods (login, password reset, etc.) will be
 *   added in future steps.
 * - This function uses a try-catch block to handle potential errors gracefully.
 */

import { NextFunction, Request, Response } from 'express';
import { createUser } from '../services/user-service';
import { isPasswordValid } from '../utils/password-validator';

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

    // 1. Controleer of email en wachtwoord aanwezig zijn
    if (!email || !password) {
      res.status(400).json({
        error: 'Email en wachtwoord zijn verplichte velden.',
      });
      return;
    }

    // 2. Valideer de sterkte van het wachtwoord
    if (!isPasswordValid(password)) {
      res.status(400).json({
        error: 'Wachtwoord voldoet niet aan het vereiste sterktebeleid.',
      });
      return;
    }

    // 3. Maak de gebruiker aan in de database (met gehashte wachtwoord)
    const newUser = await createUser({ email, password, role });

    // 4. Verstuur een succesrespons (bij voorkeur zonder gevoelige data zoals wachtwoordhash)
    res.status(201).json({
      message: 'Registratie succesvol.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
    return;
  } catch (error: any) {
    // Indien er een fout optreedt (bijv. email is al in gebruik), geef de fout door
    next(error);
  }
}
