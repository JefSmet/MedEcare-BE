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

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Role
 *   description: Endpoints for managing roles
 *
 * /admin/roles:
 *   get:
 *     summary: List all roles
 *     tags: [Role]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: List of all roles
 *   post:
 *     summary: Create a new role
 *     tags: [Role]
 *     security:
 *       - CookieAuth: []
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
 *         description: Newly created role
 *
 * /admin/roles/{id}:
 *   get:
 *     summary: Retrieve a role
 *     tags: [Role]
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
 *         description: The requested role
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a role
 *     tags: [Role]
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated role
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a role
 *     tags: [Role]
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
 *         description: Deletion successful
 *       404:
 *         description: Not found
 */
router.get('/', jwtAuth, requireAdmin, listRoles);
router.post('/', jwtAuth, requireAdmin, createRole);
router.get('/:id', jwtAuth, requireAdmin, getRoleById);
router.put('/:id', jwtAuth, requireAdmin, updateRole);
router.delete('/:id', jwtAuth, requireAdmin, deleteRole);

export default router;
