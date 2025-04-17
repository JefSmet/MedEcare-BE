/**
 * @description
 * Routes voor ShiftTypeRate-CRUD, alleen admin.
 *
 * @openapi
 * tags:
 *   name: ShiftTypeRate
 *   description: Endpoints voor het beheren van tarieven per ShiftType
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
 *     summary: Lijst shift type rates
 *     tags: [ShiftTypeRate]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Array van shift type rates
 *   post:
 *     summary: Maak een nieuw tarief aan
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
 *         description: Nieuw tarief aangemaakt
 *
 * /admin/shift-type-rates/{id}:
 *   get:
 *     summary: Haal een tarief op
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
 *         description: Gevonden tarief
 *       404:
 *         description: Niet gevonden
 *   put:
 *     summary: Update een bestaand tarief
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
 *         description: Geüpdatet record
 *       404:
 *         description: Niet gevonden
 *   delete:
 *     summary: Verwijder een tarief
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
 *         description: Verwijdering gelukt
 *       404:
 *         description: Niet gevonden
 */
const router = Router();

router.get('/', jwtAuth, requireAdmin, listShiftTypeRates);
router.post('/', jwtAuth, requireAdmin, createShiftTypeRate);
router.get('/:id', jwtAuth, requireAdmin, getShiftTypeRateById);
router.put('/:id', jwtAuth, requireAdmin, updateShiftTypeRate);
router.delete('/:id', jwtAuth, requireAdmin, deleteShiftTypeRate);

export default router;
