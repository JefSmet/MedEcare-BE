import { Router } from 'express';
import {
  createShiftType,
  deleteShiftType,
  getShiftTypeById,
  listShiftTypes,
  updateShiftType,
} from '../controllers/shift-type-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: ShiftType
 *     description: Endpoints for managing shift types
 *
 * /admin/shift-types:
 *   get:
 *     summary: List all shift types
 *     tags: [ShiftType]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Array of shift types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShiftType'
 *   post:
 *     summary: Create a new shift type
 *     tags: [ShiftType]
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
 *               - startHour
 *               - startMinute
 *               - durationMinutes
 *             properties:
 *               name:
 *                 type: string
 *               startHour:
 *                 type: integer
 *               startMinute:
 *                 type: integer
 *               durationMinutes:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The newly created shift type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftType'
 *
 * /admin/shift-types/{id}:
 *   get:
 *     summary: Retrieve a shift type by ID
 *     tags: [ShiftType]
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
 *         description: The requested shift type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftType'
 *       404:
 *         description: Shift type not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *   put:
 *     summary: Update an existing shift type
 *     tags: [ShiftType]
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
 *             $ref: '#/components/schemas/ShiftType'
 *     responses:
 *       200:
 *         description: The updated shift type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftType'
 *       404:
 *         description: Shift type not found
 *   delete:
 *     summary: Delete a shift type
 *     tags: [ShiftType]
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
 *         description: Shift type not found
 */
router.get('/', jwtAuth, requireAdmin, listShiftTypes);
router.post('/', jwtAuth, requireAdmin, createShiftType);
router.get('/:id', jwtAuth, requireAdmin, getShiftTypeById);
router.put('/:id', jwtAuth, requireAdmin, updateShiftType);
router.delete('/:id', jwtAuth, requireAdmin, deleteShiftType);

export default router;
