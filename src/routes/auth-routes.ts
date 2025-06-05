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
import { sanitizeInput } from '../middleware/validation-middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints (register, login, refresh, etc.)
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
 *         description: The newly registered user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *
 * /auth/login:
 *   post:
 *     summary: Login a user
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
 *               - platform
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               platform:
 *                 type: string
 *                 description: Platform from which the user logs in (e.g. "web", "mobile")
 *     responses:
 *       200:
 *         description: The logged in user with tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       204:
 *         description: Successful logout
 *
 * /auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Auth]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: New authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post('/register', sanitizeInput, register);
router.post('/login', sanitizeInput, loginRateLimiter, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', jwtAuth, changePassword);
router.post('/logout', logout);

export default router;
