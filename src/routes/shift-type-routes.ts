/**
 * @description
 * Routes for ShiftType CRUD, accessible only to admins.
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

const router = Router();

/**
 * @openapi
 * /admin/shift-types:
 *   get:
 *     summary: List all shift types
 *     tags: [ShiftType]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Array of shift types
 *   post:
 *     summary: Create a new ShiftType
 *     tags: [ShiftType]
 *     security:
 *       - CookieAuth: []
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
 *         description: Newly created ShiftType
 *
 * /admin/shift-types/{id}:
 *   get:
 *     summary: Retrieve a ShiftType
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
 *         description: The requested ShiftType
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a ShiftType
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
 *         description: Updated ShiftType
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a ShiftType
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
 *         description: Deletion completed
 *       404:
 *         description: Not found
 */
router.get('/', jwtAuth, requireAdmin, listShiftTypes);
router.post('/', jwtAuth, requireAdmin, createShiftType);
router.get('/:id', jwtAuth, requireAdmin, getShiftTypeById);
router.put('/:id', jwtAuth, requireAdmin, updateShiftType);
router.delete('/:id', jwtAuth, requireAdmin, deleteShiftType);

export default router;
