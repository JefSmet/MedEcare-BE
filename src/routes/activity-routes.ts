/**
 * @description
 * Routes for Activity CRUD, protected by admin.
 *
 * Endpoints:
 * GET /admin/activities
 * POST /admin/activities
 * GET /admin/activities/:id
 * PUT /admin/activities/:id
 * DELETE /admin/activities/:id
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

router.get('/', jwtAuth, requireAdmin, listActivities);
router.post('/', jwtAuth, requireAdmin, createActivity);
router.get('/:id', jwtAuth, requireAdmin, getActivityById);
router.put('/:id', jwtAuth, requireAdmin, updateActivity);
router.delete('/:id', jwtAuth, requireAdmin, deleteActivity);

export default router;
