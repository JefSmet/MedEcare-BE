/**
 * @description
 * Routes for Activity CRUD, protected by admin.
 *
 * @openapi
 * tags:
 *   name: Activity
 *   description: Endpoints for managing activities
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
 *     summary: List all activities
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of all activities.
 *   post:
 *     summary: Create a new activity
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
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
 *         description: The newly created activity.
 *
 * /admin/activities/{id}:
 *   get:
 *     summary: Get a specific activity by ID
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The activity ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested activity.
 *       404:
 *         description: Activity not found.
 *   put:
 *     summary: Update an existing activity
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The activity ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
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
 *         description: The updated activity.
 *       404:
 *         description: Activity not found.
 *   delete:
 *     summary: Delete an activity
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The activity ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A message confirming deletion.
 *       404:
 *         description: Activity not found.
 */

router.get('/', jwtAuth, requireAdmin, listActivities);
router.post('/', jwtAuth, requireAdmin, createActivity);
router.get('/:id', jwtAuth, requireAdmin, getActivityById);
router.put('/:id', jwtAuth, requireAdmin, updateActivity);
router.delete('/:id', jwtAuth, requireAdmin, deleteActivity);

export default router;
