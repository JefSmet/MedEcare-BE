/**
 * @description
 * The Auth Routes file defines all the endpoints related to authentication,
 * such as /register, /login, /refresh, /forgot-password, /reset-password, etc.
 *
 * Key features:
 * - POST /auth/register: Registers a new user
 * - POST /auth/login: Logs in a user, returning JWT tokens
 * - POST /auth/refresh: Exchanges an existing refresh token for a new pair
 * - POST /auth/forgot-password: Sends a reset link via email
 * - POST /auth/reset-password: Sets a new password using a valid reset token
 * - POST /auth/change-password: Changes a user's password while logged in
 * - POST /auth/logout: Invalidates the user's refresh token
 *
 * @dependencies
 * - express: for creating a Router.
 * - auth-controller: where the actual controller logic is implemented.
 * - auth-middleware: for JWT authentication checks.
 * - loginRateLimiter: from config/rate-limit for limiting login attempts.
 *
 * @notes
 * - Make sure to keep the routes minimal; all logic lives in the controller.
 * - Rate limiting is now applied to the login endpoint for security.
 */

import { Router } from 'express';
import {
  forgotPassword,
  login,
  refreshToken,
  register,
  resetPassword,
  changePassword,
  logout,
} from '../controllers/auth-controller';

// We need our JWT auth middleware
import { jwtAuth } from '../middleware/auth-middleware';

// Import the login rate limiter
import { loginRateLimiter } from '../config/rate-limit';

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
 *
 * Now rate-limited to a maximum of 10 attempts per 15 minutes per IP.
 */
router.post('/login', loginRateLimiter, login);

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

/**
 * POST /auth/reset-password
 * ----------------------------------------------------------------------------
 * Completes the password reset process by accepting the token and new password.
 * Expects JSON body containing:
 *   {
 *     "token": "randomGeneratedToken",
 *     "newPassword": "NewStrongPass!1"
 *   }
 */
router.post('/reset-password', resetPassword);

/**
 * POST /auth/change-password
 * ----------------------------------------------------------------------------
 * Allows an authenticated user to change their password if they supply the correct old password.
 * Requires a valid JWT in the Authorization header: "Bearer <accessToken>".
 * Expects JSON body containing:
 *   {
 *     "oldPassword": "OldPass123!",
 *     "newPassword": "NewPass456!"
 *   }
 */
router.post('/change-password', jwtAuth, changePassword);

/**
 * POST /auth/logout
 * ----------------------------------------------------------------------------
 * Invalidates the specified refresh token so it can no longer be used.
 * Expects JSON body containing:
 *   {
 *     "refreshToken": "the_refresh_token_here"
 *   }
 * If no refreshToken is provided, it still returns success (idempotent).
 */
router.post('/logout', logout);

export default router;
