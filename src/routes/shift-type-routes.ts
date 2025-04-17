/**
 * @description
 * Routes voor ShiftType-CRUD, enkel admin.
 *
 * @openapi
 * tags:
 *   name: ShiftType
 *   description: Endpoints voor het beheren van shift types
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
 *     summary: Lijst alle shift types
 *     tags: [ShiftType]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Array van shift types
 *   post:
 *     summary: Maak een nieuw ShiftType aan
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
 *         description: Nieuw aangemaakt ShiftType
 *
 * /admin/shift-types/{id}:
 *   get:
 *     summary: Haal ShiftType op
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
 *         description: Het gevraagde ShiftType
 *       404:
 *         description: Niet gevonden
 *   put:
 *     summary: Update een ShiftType
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
 *         description: Geüpdatete ShiftType
 *       404:
 *         description: Niet gevonden
 *   delete:
 *     summary: Verwijder een ShiftType
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
 *         description: Verwijdering voltooid
 *       404:
 *         description: Niet gevonden
 */
const router = Router();

router.get('/', jwtAuth, requireAdmin, listShiftTypes);
router.post('/', jwtAuth, requireAdmin, createShiftType);
router.get('/:id', jwtAuth, requireAdmin, getShiftTypeById);
router.put('/:id', jwtAuth, requireAdmin, updateShiftType);
router.delete('/:id', jwtAuth, requireAdmin, deleteShiftType);

export default router;
