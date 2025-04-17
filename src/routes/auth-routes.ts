/**
 * @description
 * De Auth Routes definieert alle endpoints gerelateerd aan authenticatie:
 * /register, /login, /refresh, /forgot-password, /reset-password, /change-password, /logout
 *
 * Belangrijk:
 * - Vanaf nu worden JWT-tokens alleen in HttpOnly cookies gezet/gelezen.
 * - De OpenAPI documentatie is hierop aangepast (CookieAuth i.p.v. BearerAuth).
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
 *     summary: Registreer een nieuwe gebruiker
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
 *                 description: Optioneel, bijvoorbeeld "ADMIN" of "USER"
 *               personId:
 *                 type: string
 *                 description: Indien je al een bestaande Person wilt koppelen
 *     responses:
 *       201:
 *         description: Gebruiker succesvol geregistreerd
 *       400:
 *         description: Validatiefout of ontbrekende velden
 */
router.post('/register', register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in met e-mail en wachtwoord
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
 *                 description: "web of mobile"
 *     responses:
 *       200:
 *         description: Inloggen gelukt; tokens zijn gezet als HttpOnly cookies. De JSON bevat alleen een gebruiker-object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login succesvol."
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
 *         description: Foutieve inloggegevens
 *       429:
 *         description: Te veel inlogpogingen (rate limit)
 */
router.post('/login', loginRateLimiter, login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Vernieuw de JWT-tokens via de refreshToken (ingelezen uit cookie)
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
 *                 description: "web of mobile"
 *     responses:
 *       200:
 *         description: Nieuwe tokens gezet in cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tokens succesvol vernieuwd."
 *       400:
 *         description: Geen refreshToken-cookie aanwezig
 *       401:
 *         description: Refresh token is ongeldig of verlopen
 *       404:
 *         description: Refresh token niet gevonden
 */
router.post('/refresh', refreshToken);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Vraag een e-mail aan om je wachtwoord te resetten
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
 *         description: Resetlink verzonden (als email geldig is).
 *       400:
 *         description: Ontbrekend e-mailadres
 *       404:
 *         description: Geen gebruiker gevonden met dit e-mailadres
 */
router.post('/forgot-password', forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset het wachtwoord op basis van een reset-token
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
 *         description: Wachtwoord succesvol gereset
 *       400:
 *         description: Ontbrekende velden of token verlopen
 *       404:
 *         description: Ongeldig reset-token
 */
router.post('/reset-password', resetPassword);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Verander het wachtwoord van de ingelogde gebruiker (JWT uit cookie)
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
 *         description: Wachtwoord succesvol gewijzigd
 *       400:
 *         description: Ontbrekende velden of wachtwoord te zwak
 *       401:
 *         description: Oude wachtwoord is onjuist of niet ingelogd
 */
router.post('/change-password', jwtAuth, changePassword);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Invalideer de refresh token (uit cookie) en wis de auth-cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Refresh token ongeldig gemaakt, cookies gewist.
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
