/**
 * @description
 * The Auth Routes file defines all the endpoints related to authentication,
 * such as /register, /login, /forgot-password, etc.
 *
 * In this step, we only have the POST /auth/register route.
 * 
 * Key features:
 * - Defines a dedicated router for all authentication endpoints.
 * - Routes are mounted on /auth prefix in app.ts.
 *
 * @dependencies
 * - express: for creating a Router.
 * - auth-controller: where the actual controller logic is implemented.
 *
 * @notes
 * - Additional endpoints will be added (login, logout, etc.) in future steps.
 */

import { Router } from 'express';
import { register } from '../controllers/auth-controller';

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

export default router;
