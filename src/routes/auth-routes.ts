/**
 * @description
 * The Auth Routes define all endpoints related to authentication:
 * /register, /login, /refresh, /forgot-password, /reset-password, /change-password, /logout
 *
 * Note:
 * - From now on, JWT tokens are only set/read in HttpOnly cookies.
 * - The OpenAPI documentation has been updated accordingly (CookieAuth instead of BearerAuth).
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
import { jwtAuth } from '../middleware/auth-middleware';
import { loginRateLimiter } from '../config/rate-limit';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: Optional, e.g. "ADMIN" or "USER"
 *               personId:
 *                 type: string
 *                 description: If you want to link to an existing Person
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Validation error or missing fields
 */
router.post('/register', register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               platform:
 *                 type: string
 *                 description: "web or mobile"
 *     responses:
 *       200:
 *         description: Login successful; tokens are set as HttpOnly cookies. The JSON contains only a user object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                     personId:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts (rate limit)
 */
router.post('/login', loginRateLimiter, login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh the JWT tokens via the refreshToken (read from cookie)
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *                 description: "web or mobile"
 *     responses:
 *       200:
 *         description: New tokens set in cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tokens successfully refreshed."
 *       400:
 *         description: No refreshToken cookie present
 *       401:
 *         description: Refresh token is invalid or expired
 *       404:
 *         description: Refresh token not found
 */
router.post('/refresh', refreshToken);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request an email to reset your password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset instructions sent (if the email is valid)
 *       400:
 *         description: Missing email address
 *       404:
 *         description: No user found with this email address
 */
router.post('/forgot-password', forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset the password using a reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Missing fields or token expired
 *       404:
 *         description: Invalid reset token
 */
router.post('/reset-password', resetPassword);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Change the password of the logged-in user (JWT from cookie)
 *     tags: [Auth]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password successfully changed
 *       400:
 *         description: Missing fields or password too weak
 *       401:
 *         description: Old password is incorrect or not authenticated
 */
router.post('/change-password', jwtAuth, changePassword);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Invalidate the refresh token (from cookie) and clear the auth cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Refresh token invalidated, cookies cleared.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/logout', logout);

export default router;
