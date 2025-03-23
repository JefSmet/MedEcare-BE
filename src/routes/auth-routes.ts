/**
 * @description
 * The Auth Routes file defines all the endpoints related to authentication,
 * such as /register, /login, /refresh, /forgot-password, /reset-password, etc.
 *
 * Key features:
 * - POST /auth/register
 * - POST /auth/login
 * - POST /auth/refresh
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 * - POST /auth/change-password
 * - POST /auth/logout
 *
 * @openapi
 * tags:
 *   name: Auth
 *   description: Authentication-related endpoints
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
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
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
 *                 description: 'web' or 'mobile'
 *     responses:
 *       200:
 *         description: Login successful; returns user info and JWT tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
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
 *     summary: Refresh JWT tokens using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *               platform:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns new accessToken and refreshToken
 *       400:
 *         description: Missing refreshToken
 *       401:
 *         description: Invalid or expired refreshToken
 *       404:
 *         description: Refresh token not found
 */
router.post('/refresh', refreshToken);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
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
 *         description: Reset link emailed (if email was valid)
 *       400:
 *         description: Missing email
 *       404:
 *         description: No user found with that email
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
 *         description: Password reset successful
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
 *     summary: Change password for the logged-in user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
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
 *         description: Password changed successfully
 *       400:
 *         description: Missing fields or password too weak
 *       401:
 *         description: Old password incorrect or unauthorized
 */
router.post('/change-password', jwtAuth, changePassword);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Invalidate an existing refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refresh token invalidated (if provided)
 */
router.post('/logout', logout);

export default router;
