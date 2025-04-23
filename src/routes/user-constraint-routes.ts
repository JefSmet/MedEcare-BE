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
 *   name: UserConstraint
 *   description: Endpoints for managing user/person constraints
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
 *         description: The newly created constraint
 *
 * /admin/user-constraints/{id}:
 *   get:
 *     summary: Retrieve a constraint
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
 *         description: The requested constraint
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a constraint
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
 *         description: Updated constraint
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a constraint
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
 *         description: Constraint deleted
 *       404:
 *         description: Not found
 */
router.get('/', jwtAuth, requireAdmin, listUserConstraints);
router.post('/', jwtAuth, requireAdmin, createUserConstraint);
router.get('/:id', jwtAuth, requireAdmin, getUserConstraintById);
router.put('/:id', jwtAuth, requireAdmin, updateUserConstraint);
router.delete('/:id', jwtAuth, requireAdmin, deleteUserConstraint);

export default router;
