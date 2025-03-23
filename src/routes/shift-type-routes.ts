/**
 * @description
 * Routes for ShiftType CRUD, protected by admin.
 *
 * Endpoints:
 * GET /admin/shift-types
 * POST /admin/shift-types
 * GET /admin/shift-types/:id
 * PUT /admin/shift-types/:id
 * DELETE /admin/shift-types/:id
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

router.get('/', jwtAuth, requireAdmin, listShiftTypes);
router.post('/', jwtAuth, requireAdmin, createShiftType);
router.get('/:id', jwtAuth, requireAdmin, getShiftTypeById);
router.put('/:id', jwtAuth, requireAdmin, updateShiftType);
router.delete('/:id', jwtAuth, requireAdmin, deleteShiftType);

export default router;
