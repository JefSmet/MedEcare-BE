/**
 * @description
 * Routes voor Activity CRUD, alleen toegankelijk voor admin.
 *
 * @openapi
 * tags:
 *   name: Activity
 *   description: Endpoints voor activiteiten (shiften/verlof/etc.)
 */

import { Router } from 'express';
import {
  createActivity,
  deleteActivity,
  getActivityById,
  listActivities,
  updateActivity,
} from '../controllers/activity-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

/**
 * @openapi
 * /admin/activities:
 *   get:
 *     summary: Lijst alle activiteiten
 *     tags: [Activity]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Geeft een lijst van alle activiteiten
 *   post:
 *     summary: Maak een nieuwe activiteit aan
 *     tags: [Activity]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activityType:
 *                 type: string
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *               personId:
 *                 type: string
 *               shiftTypeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: De nieuw aangemaakte activiteit
 *
 * /admin/activities/{id}:
 *   get:
 *     summary: Haal één activiteit op
 *     tags: [Activity]
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
 *         description: De opgevraagde activiteit
 *       404:
 *         description: Niet gevonden
 *   put:
 *     summary: Update een bestaande activiteit
 *     tags: [Activity]
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
 *               activityType:
 *                 type: string
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *               personId:
 *                 type: string
 *               shiftTypeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: De geüpdatete activiteit
 *       404:
 *         description: Niet gevonden
 *   delete:
 *     summary: Verwijder een activiteit
 *     tags: [Activity]
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
 *         description: Succes-bericht
 *       404:
 *         description: Niet gevonden
 */
router.get('/', jwtAuth, requireAdmin, listActivities);
router.post('/', jwtAuth, requireAdmin, createActivity);
router.get('/:id', jwtAuth, requireAdmin, getActivityById);
router.put('/:id', jwtAuth, requireAdmin, updateActivity);
router.delete('/:id', jwtAuth, requireAdmin, deleteActivity);

export default router;
