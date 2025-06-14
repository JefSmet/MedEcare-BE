import { Router } from 'express';
import {
  createUserConstraint,
  deleteUserConstraint,
  getUserConstraintById,
  listUserConstraints,
  updateUserConstraint,
} from '../controllers/user-constraint-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: UserConstraint
 *     description: Endpoints for managing user constraints
 *
 * /admin/user-constraints:
 *   get:
 *     summary: List all user constraints
 *     tags: [UserConstraint]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: List of user constraints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserConstraint'
 *   post:
 *     summary: Create a new user constraint
 *     tags: [UserConstraint]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personId
 *             properties:
 *               personId:
 *                 type: string
 *     responses:
 *       201:
 *         description: The newly created user constraint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConstraint'
 *
 * /admin/user-constraints/{id}:
 *   get:
 *     summary: Retrieve a user constraint by ID
 *     tags: [UserConstraint]
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
 *         description: The requested user constraint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConstraint'
 *       404:
 *         description: User constraint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *   put:
 *     summary: Update an existing user constraint
 *     tags: [UserConstraint]
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
 *             $ref: '#/components/schemas/UserConstraint'
 *     responses:
 *       200:
 *         description: The updated user constraint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConstraint'
 *       404:
 *         description: User constraint not found
 *   delete:
 *     summary: Delete a user constraint
 *     tags: [UserConstraint]
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
 *         description: User constraint not found
 */
router.get('/', jwtAuth, requireAdmin, listUserConstraints);
router.post('/', jwtAuth, requireAdmin, createUserConstraint);
router.get('/:id', jwtAuth, requireAdmin, getUserConstraintById);
router.put('/:id', jwtAuth, requireAdmin, updateUserConstraint);
router.delete('/:id', jwtAuth, requireAdmin, deleteUserConstraint);

export default router;
