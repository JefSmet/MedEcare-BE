/**
 * @description
 * Provides role-based authorization middleware functions for admin-only routes.
 *
 * Key features:
 * - requireAdmin: Verifies that the user has the 'ADMIN' role in user.roles array. If not, returns 403.
 *
 * @dependencies
 * - express: For the RequestHandler type
 *
 * @notes
 * - Used in conjunction with JWT authentication (jwtAuth) from auth-middleware.ts
 *   so that `req.user` is populated with the currently authenticated user data.
 * - The user model now has a M:N relationship with Role via UserRole. We flatten roles into user.roles.
 */

import { RequestHandler } from 'express';

export const requireAdmin: RequestHandler = (req, res, next) => {
  const user = req.user as { roles?: string[] } | undefined;

  if (!user || !Array.isArray(user.roles) || !user.roles.includes('ADMIN')) {
    res.status(403).json({
      error: 'Forbidden. Admin access only.',
    });
    return;
  }

  next();
};

