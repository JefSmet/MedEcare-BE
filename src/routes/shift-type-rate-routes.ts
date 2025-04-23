import { Router } from 'express';
import {
  createShiftTypeRate,
  deleteShiftTypeRate,
  getShiftTypeRateById,
  listShiftTypeRates,
  updateShiftTypeRate,
} from '../controllers/shift-type-rate-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: ShiftTypeRate
 *   description: Endpoints for managing ShiftType rates
 *
 * /admin/shift-type-rates:
 *   get:
 *     summary: List shift type rates
 *     tags: [ShiftTypeRate]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Array of shift type rates
 *   post:
 *     summary: Create a new rate
 *     tags: [ShiftTypeRate]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shiftTypeId:
 *                 type: string
 *               rate:
 *                 type: number
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: New rate created
 *
 * /admin/shift-type-rates/{id}:
 *   get:
 *     summary: Retrieve a rate
 *     tags: [ShiftTypeRate]
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
 *         description: Found rate
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update an existing rate
 *     tags: [ShiftTypeRate]
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
 *               shiftTypeId:
 *                 type: string
 *               rate:
 *                 type: number
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Updated record
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a rate
 *     tags: [ShiftTypeRate]
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
router.get('/', jwtAuth, requireAdmin, listShiftTypeRates);
router.post('/', jwtAuth, requireAdmin, createShiftTypeRate);
router.get('/:id', jwtAuth, requireAdmin, getShiftTypeRateById);
router.put('/:id', jwtAuth, requireAdmin, updateShiftTypeRate);
router.delete('/:id', jwtAuth, requireAdmin, deleteShiftTypeRate);

export default router;
