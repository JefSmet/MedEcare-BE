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
 * tags:
 *   name: Activity
 *   description: Endpoints for managing activities (shifts, leave, conferences, etc.)
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
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   activityType:
 *                     type: string
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *                   personId:
 *                     type: string
 *                   shiftTypeId:
 *                     type: string
 *                     nullable: true
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   person:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                   shiftType:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       color:
 *                         type: string
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
 *             type: object
 *             required:
 *               - activityType
 *               - start
 *               - end
 *               - personId
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
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 activityType:
 *                   type: string
 *                 start:
 *                   type: string
 *                   format: date-time
 *                 end:
 *                   type: string
 *                   format: date-time
 *                 personId:
 *                   type: string
 *                 shiftTypeId:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 person:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                 shiftType:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                       name:
 *                         type: string
 *                       color:
 *                         type: string
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
 *         description: The updated activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 activityType:
 *                   type: string
 *                 start:
 *                   type: string
 *                   format: date-time
 *                 end:
 *                   type: string
 *                   format: date-time
 *                 personId:
 *                   type: string
 *                 shiftTypeId:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
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
 */
router.get('/', jwtAuth, requireAdmin, listActivities);
router.post('/', jwtAuth, requireAdmin, createActivity);
router.get('/:id', jwtAuth, requireAdmin, getActivityById);
router.put('/:id', jwtAuth, requireAdmin, updateActivity);
router.delete('/:id', jwtAuth, requireAdmin, deleteActivity);

export default router;
