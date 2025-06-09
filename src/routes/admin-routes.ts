import { Router } from 'express';
import {
  createNewUser,
  deleteExistingUser,
  getUserById,
  listUsers,
  updateExistingUser,
} from '../controllers/admin-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin endpoints for user management
 *
 * /admin/users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Admin]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminUserResponse'
 *             example:
 *               - personId: "user-123"
 *                 email: "jane.doe@example.com"
 *                 createdAt: "2025-06-09T10:00:00Z"
 *                 updatedAt: "2025-06-09T10:00:00Z"
 *                 userRoles:
 *                   - userId: "user-123"
 *                     roleId: "role-456"
 *                     role:
 *                       id: "role-456"
 *                       name: "ADMIN"
 *                 person:
 *                   id: "person-123"
 *                   firstName: "Jane"
 *                   lastName: "Doe"
 *                   dateOfBirth: "1990-05-15"
 *                   createdAt: "2025-01-01T08:00:00Z"
 *                   updatedAt: "2025-05-01T08:00:00Z"
 *                   doctor:
 *                     personId: "person-123"
 *                     rizivNumber: "BE12345678901"
 *                     isEnabledInShifts: true
 *                     createdAt: "2025-05-28T12:00:00Z"
 *                     updatedAt: "2025-05-28T12:00:00Z"
 *   post:
 *     summary: Create a new user
 *     tags: [Admin]
 *     security:
 *       - CookieAuth: []
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
 *                 description: Optional user role, e.g., ADMIN or USER
 *     responses:
 *       201:
 *         description: The newly created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUserResponse'
 *
 * /admin/users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags: [Admin]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUserResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *   put:
 *     summary: Update an existing user (authenticated users)
 *     description: Does not require admin privileges, only authentication
 *     tags: [Admin]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUserRequestBody'
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUserResponse'
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 */
router.get('/users', jwtAuth, requireAdmin, listUsers);
router.get('/users/:id', jwtAuth, requireAdmin, getUserById);
router.post('/users', jwtAuth, requireAdmin, createNewUser);
router.put('/users/:id', jwtAuth, updateExistingUser);
router.delete('/users/:id', jwtAuth, requireAdmin, deleteExistingUser);

export default router;
