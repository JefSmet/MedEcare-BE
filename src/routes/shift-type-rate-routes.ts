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
 *   - name: ShiftTypeRate
 *     description: Endpoints for managing shift-type rates
 *
 * /admin/shift-type-rates:
 *   get:
 *     summary: List all shift-type rates
 *     tags: [ShiftTypeRate]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Array of shift-type rates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShiftTypeRate'
 *   post:
 *     summary: Create a new shift-type rate
 *     tags: [ShiftTypeRate]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shiftTypeId
 *               - rate
 *               - validFrom
 *             properties:
 *               shiftTypeId:
 *                 type: string
 *               rate:
 *                 type: number
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: The newly created shift-type rate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftTypeRate'
 *
 * /admin/shift-type-rates/{id}:
 *   get:
 *     summary: Retrieve a shift-type rate by ID
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
 *         description: The requested shift-type rate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftTypeRate'
 *       404:
 *         description: Shift-type rate not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *   put:
 *     summary: Update an existing shift-type rate
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
 *             $ref: '#/components/schemas/ShiftTypeRate'
 *     responses:
 *       200:
 *         description: The updated shift-type rate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftTypeRate'
 *       404:
 *         description: Shift-type rate not found
 *   delete:
 *     summary: Delete a shift-type rate
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
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Shift-type rate not found
 */
router.get('/', jwtAuth, requireAdmin, listShiftTypeRates);
router.post('/', jwtAuth, requireAdmin, createShiftTypeRate);
router.get('/:id', jwtAuth, requireAdmin, getShiftTypeRateById);
router.put('/:id', jwtAuth, requireAdmin, updateShiftTypeRate);
router.delete('/:id', jwtAuth, requireAdmin, deleteShiftTypeRate);

export default router;
