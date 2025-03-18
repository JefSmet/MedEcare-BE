/**
 * @description
 * The Auth Routes file defines all the endpoints related to authentication,
 * such as /register, /login, /refresh, /forgot-password, etc.
 *
 * Key features:
 * - POST /auth/register: Registers a new user
 * - POST /auth/login: Logs in a user, returning JWT tokens
 * - POST /auth/refresh: Exchanges an existing refresh token for a new pair
 * - POST /auth/forgot-password: Sends a reset link via email
 *
 * @dependencies
 * - express: for creating a Router.
 * - auth-controller: where the actual controller logic is implemented.
 *
 * @notes
 * - Additional endpoints (reset-password) will come in a future step.
 */

import { Router } from 'express';
import {
  forgotPassword,
  login,
  refreshToken,
  register,
} from '../controllers/auth-controller';

const router = Router();

/**
 * POST /auth/register
 * ----------------------------------------------------------------------------
 * Registers a new user. Expects JSON body containing:
 *   {
 *     "email": "user@example.com",
 *     "password": "StrongPass#1"
 *   }
 */
router.post('/register', register);

/**
 * POST /auth/login
 * ----------------------------------------------------------------------------
 * Logs a user in using Local Strategy. Expects JSON body containing:
 *   {
 *     "email": "user@example.com",
 *     "password": "StrongPass#1",
 *     "platform": "web" | "mobile" (optional)
 *   }
 */
router.post('/login', login);

/**
 * POST /auth/refresh
 * ----------------------------------------------------------------------------
 * Refreshes tokens using an existing refresh token. Expects:
 *   {
 *     "refreshToken": "<valid refresh token>",
 *     "platform": "web" | "mobile" (optional)
 *   }
 */
router.post('/refresh', refreshToken);

/**
 * POST /auth/forgot-password
 * ----------------------------------------------------------------------------
 * Initiates a password reset flow by sending a reset link to the user's email.
 * Expects JSON body containing:
 *   {
 *     "email": "user@example.com"
 *   }
 */
router.post('/forgot-password', forgotPassword);

export default router;
