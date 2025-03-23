/**
 * @description
 * Routes for ShiftTypeRate CRUD, protected by admin role.
 *
 * Endpoints:
 * GET /admin/shift-type-rates
 * POST /admin/shift-type-rates
 * GET /admin/shift-type-rates/:id
 * PUT /admin/shift-type-rates/:id
 * DELETE /admin/shift-type-rates/:id
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

const router = Router();

router.get('/', jwtAuth, requireAdmin, listShiftTypeRates);
router.post('/', jwtAuth, requireAdmin, createShiftTypeRate);
router.get('/:id', jwtAuth, requireAdmin, getShiftTypeRateById);
router.put('/:id', jwtAuth, requireAdmin, updateShiftTypeRate);
router.delete('/:id', jwtAuth, requireAdmin, deleteShiftTypeRate);

export default router;
