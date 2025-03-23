/**
 * @description
 * Defines all the routes for administrator-level user management.
 *
 * @openapi
 * tags:
 *   name: Admin
 *   description: Admin endpoints for user management
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

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: Retrieve a list of all users
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Array of users
 *   post:
 *     summary: Create a new user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *
 * /admin/users/{id}:
 *   put:
 *     summary: Update an existing user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deletion message
 *       404:
 *         description: User not found
 */

const router = Router();

router.get('/users', jwtAuth, requireAdmin, listUsers);
router.post('/users', jwtAuth, requireAdmin, createNewUser);
router.put('/users/:id', jwtAuth, requireAdmin, updateExistingUser);
router.delete('/users/:id', jwtAuth, requireAdmin, deleteExistingUser);

export default router;
