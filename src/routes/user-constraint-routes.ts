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
 *   description: Endpoints for managing user constraints
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
 *               maxNightShiftsPerWeek:
 *                 type: integer
 *               maxConsecutiveNightShifts:
 *                 type: integer
 *               minRestHoursBetweenShifts:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The newly created constraint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConstraint'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConstraint'
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personId:
 *                 type: string
 *               maxNightShiftsPerWeek:
 *                 type: integer
 *               maxConsecutiveNightShifts:
 *                 type: integer
 *               minRestHoursBetweenShifts:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The updated constraint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserConstraint'
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
 *         description: Deletion successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Not found
 */
router.get('/', jwtAuth, requireAdmin, listUserConstraints);
router.post('/', jwtAuth, requireAdmin, createUserConstraint);
router.get('/:id', jwtAuth, requireAdmin, getUserConstraintById);
router.put('/:id', jwtAuth, requireAdmin, updateUserConstraint);
router.delete('/:id', jwtAuth, requireAdmin, deleteUserConstraint);

export default router;
