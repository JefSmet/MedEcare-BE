/**
 * @description
 * Routes for ShiftTypeRate CRUD, protected by admin role.
 *
 * @openapi
 * tags:
 *   name: ShiftTypeRate
 *   description: Endpoints for managing shift type rates
 */

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

/**
 * @openapi
 * /admin/shift-type-rates:
 *   get:
 *     summary: List shift type rates
 *     tags: [ShiftTypeRate]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns an array of shift type rates
 *   post:
 *     summary: Create a new shift type rate
 *     tags: [ShiftTypeRate]
 *     security:
 *       - BearerAuth: []
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
 *         description: Created shift type rate
 *
 * /admin/shift-type-rates/{id}:
 *   get:
 *     summary: Get a shift type rate by ID
 *     tags: [ShiftTypeRate]
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
 *         description: The requested shift type rate
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a shift type rate
 *     tags: [ShiftTypeRate]
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
 *         description: The updated record
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a shift type rate
 *     tags: [ShiftTypeRate]
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

router.get('/', jwtAuth, requireAdmin, listShiftTypeRates);
router.post('/', jwtAuth, requireAdmin, createShiftTypeRate);
router.get('/:id', jwtAuth, requireAdmin, getShiftTypeRateById);
router.put('/:id', jwtAuth, requireAdmin, updateShiftTypeRate);
router.delete('/:id', jwtAuth, requireAdmin, deleteShiftTypeRate);

export default router;
