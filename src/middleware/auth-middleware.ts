/**
 * @description
 * Provides authentication middleware functions for protected routes.
 *
 * Key features:
 * - jwtAuth: an Express middleware requiring a valid JWT token.
 *
 * @dependencies
 * - passport: uses the 'jwt' strategy defined in passport-strategies.ts
 *
 * @notes
 * - This file can be expanded to include other authentication checks or helper methods.
 */

import { RequestHandler } from 'express';
import passport from 'passport';

/**
 * jwtAuth
 * ----------------------------------------------------------------------------
 * This middleware checks if there's a valid JWT in the Authorization header.
 * If valid, attaches the user to req.user; otherwise, returns 401 Unauthorized.
 *
 * Usage in routes:
 *   router.get('/protected', jwtAuth, (req, res) => { ... });
 */
export const jwtAuth: RequestHandler = passport.authenticate('jwt', {
  session: false,
});
