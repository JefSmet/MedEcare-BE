/**
 * @description
 * Provides role-based authorization middleware functions for admin-only routes.
 *
 * Key features:
 * - requireAdmin: Verifies that the user has the 'ADMIN' role. If not, returns a 403 Forbidden.
 *
 * @dependencies
 * - express: For the RequestHandler type
 *
 * @notes
 * - This file should be used in conjunction with JWT authentication (jwtAuth) from auth-middleware.ts
 *   so that `req.user` is populated with the currently authenticated user data.
 * - The user model has a 'role' field that is expected to contain 'ADMIN' or 'USER'.
 * - If additional roles or more complex policies are needed, you can expand this file.
 */

import { RequestHandler } from 'express';

/**
 * @constant requireAdmin
 * @description Middleware that ensures the request is coming from a user with the 'ADMIN' role.
 * If not, it sends a 403 Forbidden response.
 *
 * Usage Example:
 *    router.get('/admin-only-route', jwtAuth, requireAdmin, (req, res) => {
 *      res.send('Hello Admin!');
 *    });
 */
export const requireAdmin: RequestHandler = (req, res, next) => {
  const user = req.user as { role?: string } | undefined;

  if (!user || user.role !== 'ADMIN') {
    res.status(403).json({
      error: 'Forbidden. Admin access only.',
    });
    return;
  }

  next();
};

