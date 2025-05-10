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
 * tags:
 *   name: Auth
 *   description: Authentication endpoints (register, login, refresh, etc.)
 *
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
 *               - firstName
 *               - lastName
 *               - dateOfBirth
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: Optional, e.g. "ADMIN" or "USER"
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: User successfully registered
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
 *                     personId:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Validation error or missing fields
 *
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
 *                 description: "web, mobile, or web-persist"
 *     responses:
 *       200:
 *         description: Login successful; tokens are set as HttpOnly cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 authenticatedUser:
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
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts (rate limit)
 *
 * /auth/refresh:
 *   post:
 *     summary: Refresh the JWT tokens via the refreshToken cookie
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *                 description: "web, mobile, or web-persist"
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
 *                 authenticatedUser:
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
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: No refreshToken cookie present
 *       401:
 *         description: Invalid or expired refresh token
 *       404:
 *         description: Refresh token not found
 *
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
 *         description: Reset instructions sent (if email is valid)
 *       400:
 *         description: Missing email address
 *       404:
 *         description: No user found with this email address
 *
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
 *             required:
 *               - token
 *               - newPassword
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
 *
 * /auth/change-password:
 *   post:
 *     summary: Change the password of the logged-in user (JWT via cookie)
 *     tags: [Auth]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password successfully changed
 *       400:
 *         description: Missing fields or weak password
 *       401:
 *         description: Old password incorrect or not authenticated
 *
 * /auth/logout:
 *   post:
 *     summary: Invalidate the refresh token and clear auth cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/register', register);
router.post('/login', loginRateLimiter, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', jwtAuth, changePassword);
router.post('/logout', logout);

export default router;
