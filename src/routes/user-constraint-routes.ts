/**
 * @description
 * Routes voor UserConstraint-CRUD, enkel voor admin.
 *
 * @openapi
 * tags:
 *   name: UserConstraint
 *   description: Endpoints voor beheren van constraints per user/person
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
 *     summary: Lijst alle user constraints
 *     tags: [UserConstraint]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Lijst van user constraints
 *   post:
 *     summary: Maak een nieuwe user constraint aan
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
 *         description: De nieuw aangemaakte constraint
 *
 * /admin/user-constraints/{id}:
 *   get:
 *     summary: Haal een constraint op
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
 *         description: De gevraagde constraint
 *       404:
 *         description: Niet gevonden
 *   put:
 *     summary: Update een constraint
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
 *         description: Geüpdatet
 *       404:
 *         description: Niet gevonden
 *   delete:
 *     summary: Verwijder een constraint
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
 *         description: Constraint verwijderd
 *       404:
 *         description: Niet gevonden
 */
const router = Router();

router.get('/', jwtAuth, requireAdmin, listUserConstraints);
router.post('/', jwtAuth, requireAdmin, createUserConstraint);
router.get('/:id', jwtAuth, requireAdmin, getUserConstraintById);
router.put('/:id', jwtAuth, requireAdmin, updateUserConstraint);
router.delete('/:id', jwtAuth, requireAdmin, deleteUserConstraint);

export default router;
