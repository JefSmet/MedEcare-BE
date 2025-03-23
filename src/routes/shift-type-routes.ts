/**
 * @description
 * Routes for ShiftType CRUD, protected by admin.
 *
 * @openapi
 * tags:
 *   name: ShiftType
 *   description: Endpoints for managing shift types
 */

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

/**
 * @openapi
 * /admin/shift-types:
 *   get:
 *     summary: List all shift types
 *     tags: [ShiftType]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Array of shift types
 *   post:
 *     summary: Create a shift type
 *     tags: [ShiftType]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               startHour:
 *                 type: integer
 *               startMinute:
 *                 type: integer
 *               durationMinutes:
 *                 type: integer
 *               activeFrom:
 *                 type: string
 *                 format: date-time
 *               activeUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: The newly created shift type
 *
 * /admin/shift-types/{id}:
 *   get:
 *     summary: Get shift type by ID
 *     tags: [ShiftType]
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
 *         description: The requested shift type
 *       404:
 *         description: Shift type not found
 *   put:
 *     summary: Update a shift type
 *     tags: [ShiftType]
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
 *               name:
 *                 type: string
 *               startHour:
 *                 type: integer
 *               startMinute:
 *                 type: integer
 *               durationMinutes:
 *                 type: integer
 *               activeFrom:
 *                 type: string
 *                 format: date-time
 *               activeUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: The updated shift type
 *       404:
 *         description: Shift type not found
 *   delete:
 *     summary: Delete a shift type
 *     tags: [ShiftType]
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
 *         description: Shift type not found
 */

const router = Router();

router.get('/', jwtAuth, requireAdmin, listShiftTypes);
router.post('/', jwtAuth, requireAdmin, createShiftType);
router.get('/:id', jwtAuth, requireAdmin, getShiftTypeById);
router.put('/:id', jwtAuth, requireAdmin, updateShiftType);
router.delete('/:id', jwtAuth, requireAdmin, deleteShiftType);

export default router;
