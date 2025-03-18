/**
 * @description
 * Defines all the routes for administrator-level user management.
 *
 * Key features:
 * - GET /admin/users: List all users
 * - POST /admin/users: Create a new user
 * - PUT /admin/users/:id: Update an existing user
 * - DELETE /admin/users/:id: Delete a user
 *
 * @dependencies
 * - express: for creating Router
 * - admin-controller: implements the actual logic
 * - jwtAuth: ensures the user is logged in
 * - requireAdmin: ensures the user is admin
 *
 * @notes
 * - These routes are mounted in app.ts at /admin
 * - All routes here require admin privileges to access
 */

import { Router } from 'express';
import {
  createNewUser,
  deleteExistingUser,
  listUsers,
  updateExistingUser,
} from '../controllers/admin-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

/**
 * GET /admin/users
 * Retrieves a list of all users.
 * Requires authentication & admin role.
 */
router.get('/users', jwtAuth, requireAdmin, listUsers);

/**
 * POST /admin/users
 * Creates a new user with the specified role & password.
 * Requires authentication & admin role.
 */
router.post('/users', jwtAuth, requireAdmin, createNewUser);

/**
 * PUT /admin/users/:id
 * Updates an existing user. Can update email, password, role, etc.
 * Requires authentication & admin role.
 */
router.put('/users/:id', jwtAuth, requireAdmin, updateExistingUser);

/**
 * DELETE /admin/users/:id
 * Deletes a user by ID.
 * Requires authentication & admin role.
 */
router.delete('/users/:id', jwtAuth, requireAdmin, deleteExistingUser);

export default router;
