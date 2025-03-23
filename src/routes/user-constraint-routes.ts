/**
 * @description
 * Routes for UserConstraint CRUD, protected by admin role.
 *
 * @openapi
 * tags:
 *   name: UserConstraint
 *   description: Endpoints for managing user constraints
 */

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

/**
 * @openapi
 * /admin/user-constraints:
 *   get:
 *     summary: List all user constraints
 *     tags: [UserConstraint]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Array of user constraints
 *   post:
 *     summary: Create a new user constraint
 *     tags: [UserConstraint]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personId:
 *                 type: string
 *               maxNightShiftsPerWeek:
 *                 type: number
 *               maxConsecutiveNightShifts:
 *                 type: number
 *               minRestHoursBetweenShifts:
 *                 type: number
 *     responses:
 *       201:
 *         description: The newly created user constraint
 *
 * /admin/user-constraints/{id}:
 *   get:
 *     summary: Get a user constraint by ID
 *     tags: [UserConstraint]
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
 *         description: The requested user constraint
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a user constraint
 *     tags: [UserConstraint]
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
 *               personId:
 *                 type: string
 *               maxNightShiftsPerWeek:
 *                 type: number
 *               maxConsecutiveNightShifts:
 *                 type: number
 *               minRestHoursBetweenShifts:
 *                 type: number
 *     responses:
 *       200:
 *         description: The updated user constraint
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a user constraint
 *     tags: [UserConstraint]
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
 *         description: Not found
 */

const router = Router();

router.get('/', jwtAuth, requireAdmin, listUserConstraints);
router.post('/', jwtAuth, requireAdmin, createUserConstraint);
router.get('/:id', jwtAuth, requireAdmin, getUserConstraintById);
router.put('/:id', jwtAuth, requireAdmin, updateUserConstraint);
router.delete('/:id', jwtAuth, requireAdmin, deleteUserConstraint);

export default router;
