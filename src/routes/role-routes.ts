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
 *   - name: Role
 *     description: Endpoints for managing roles
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: The newly created role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *
 * /admin/roles/{id}:
 *   get:
 *     summary: Retrieve a role by ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *   put:
 *     summary: Update an existing role
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
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       200:
 *         description: The updated role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
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
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Role not found
 */
router.get('/', jwtAuth, requireAdmin, listRoles);
router.get('/:id', jwtAuth, requireAdmin, getRoleById);
router.post('/', jwtAuth, requireAdmin, createRole);
router.put('/:id', jwtAuth, requireAdmin, updateRole);
router.delete('/:id', jwtAuth, requireAdmin, deleteRole);

export default router;
