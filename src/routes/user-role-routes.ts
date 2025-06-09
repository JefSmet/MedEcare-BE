import { Router } from 'express';
import {
  listUserRoles,
  getUserRolesByUserId,
  getRolesByUserId,
  getUsersByRoleId,
  createUserRole,
  deleteUserRole,
} from '../controllers/user-role-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: UserRole
 *     description: Endpoints for managing user role assignments
 *
 * /admin/user-roles:
 *   get:
 *     summary: List all user role assignments
 *     tags: [UserRole]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: List of all user role assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserRole'
 *   post:
 *     summary: Assign a role to a user
 *     tags: [UserRole]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRoleRequestBody'
 *     responses:
 *       201:
 *         description: The newly created user role assignment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRole'
 *       400:
 *         description: Bad request - User/Role not found or assignment already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *
 * /admin/user-roles/user/{userId}:
 *   get:
 *     summary: Get all role assignments for a specific user
 *     tags: [UserRole]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID (person ID)
 *     responses:
 *       200:
 *         description: List of role assignments for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserRole'
 *       404:
 *         description: No roles found for this user
 *
 * /admin/user-roles/user/{userId}/roles:
 *   get:
 *     summary: Get simplified roles list for a specific user
 *     tags: [UserRole]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID (person ID)
 *     responses:
 *       200:
 *         description: List of roles for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *
 * /admin/user-roles/role/{roleId}:
 *   get:
 *     summary: Get all users with a specific role
 *     tags: [UserRole]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The role ID
 *     responses:
 *       200:
 *         description: List of users with the specified role
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserRole'
 *
 * /admin/user-roles/{userId}/{roleId}:
 *   delete:
 *     summary: Remove a role assignment from a user
 *     tags: [UserRole]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID (person ID)
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: The role ID
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
 *         description: User role assignment not found
 */

router.get('/', jwtAuth, requireAdmin, listUserRoles);
router.get('/user/:userId', jwtAuth, requireAdmin, getUserRolesByUserId);
router.get('/user/:userId/roles', jwtAuth, requireAdmin, getRolesByUserId);
router.get('/role/:roleId', jwtAuth, requireAdmin, getUsersByRoleId);
router.post('/', jwtAuth, requireAdmin, createUserRole);
router.delete('/:userId/:roleId', jwtAuth, requireAdmin, deleteUserRole);

export default router;
