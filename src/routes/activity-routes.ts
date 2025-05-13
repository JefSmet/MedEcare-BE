import { Router } from 'express';
import {
  createActivity,
  deleteActivity,
  filterActivities,
  getActivityById,
  listActivities,
  updateActivity,
} from '../controllers/activity-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Activity
 *   description: Endpoints for managing activities (shifts, leave, conferences, etc.)
 *
 * components:
 *   schemas:
 *     ActivityRequestBody:
 *       type: object
 *       required:
 *         - activityType
 *         - start
 *         - end
 *         - personId
 *       properties:
 *         activityType:
 *           type: string
 *         start:
 *           type: string
 *           format: date-time
 *         end:
 *           type: string
 *           format: date-time
 *         personId:
 *           type: string
 *         shiftTypeId:
 *           type: string
 *         status:
 *           type: string
 *           description: Status of the activity (SCHEDULED, COMPLETED, CANCELLED, etc.)
 *           default: SCHEDULED
 *
 * /admin/activities:
 *   get:
 *     summary: List all activities
 *     tags: [Activity]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of all activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 *   post:
 *     summary: Create a new activity
 *     tags: [Activity]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityRequestBody'
 *     responses:
 *       201:
 *         description: The newly created activity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *
 * /admin/activities/{id}:
 *   get:
 *     summary: Retrieve a single activity
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
 *         description: The requested activity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Activity not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *   put:
 *     summary: Update an existing activity
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
 *             $ref: '#/components/schemas/ActivityRequestBody'
 *     responses:
 *       200:
 *         description: The updated activity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Activity not found
 *   delete:
 *     summary: Delete an activity
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
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Activity not found
 * /admin/activities/filter:
 *   get:
 *     summary: List activities filtered by year, month, and activityType
 *     tags: [Activity]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: The year to filter activities by
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: The month (1-12) to filter activities by
 *       - in: query
 *         name: activityType
 *         required: false
 *         schema:
 *           type: string
 *         description: The activity type to filter by
 *     responses:
 *       200:
 *         description: Returns a list of filtered activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 */
router.get('/filter', jwtAuth, requireAdmin, filterActivities);

router.get('/', jwtAuth, requireAdmin, listActivities);
router.post('/', jwtAuth, requireAdmin, createActivity);
router.get('/:id', jwtAuth, requireAdmin, getActivityById);
router.put('/:id', jwtAuth, requireAdmin, updateActivity);
router.delete('/:id', jwtAuth, requireAdmin, deleteActivity);

export default router;
