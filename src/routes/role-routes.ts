/**
 * @description
 * Defines routes for Role CRUD, protected by admin role.
 *
 * @openapi
 * tags:
 *   name: Role
 *   description: Endpoints for managing roles
 */

import { Router } from 'express';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';
import {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../controllers/role-controller';

/**
 * @openapi
 * /admin/roles:
 *   get:
 *     summary: List all roles
 *     tags: [Role]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of roles
 *   post:
 *     summary: Create a new role
 *     tags: [Role]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: The newly created role
 *
 * /admin/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Role]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The role ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested role
 *       404:
 *         description: Role not found
 *   put:
 *     summary: Update a role
 *     tags: [Role]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The role ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated role
 *       404:
 *         description: Role not found
 *   delete:
 *     summary: Delete a role
 *     tags: [Role]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The role ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deletion message
 *       404:
 *         description: Role not found
 */

const router = Router();

router.get('/', jwtAuth, requireAdmin, listRoles);
router.post('/', jwtAuth, requireAdmin, createRole);
router.get('/:id', jwtAuth, requireAdmin, getRoleById);
router.put('/:id', jwtAuth, requireAdmin, updateRole);
router.delete('/:id', jwtAuth, requireAdmin, deleteRole);

export default router;
