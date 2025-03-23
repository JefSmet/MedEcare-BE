/**
 * @description
 * Defines routes for Role CRUD, protected by admin role.
 *
 * Endpoints:
 * GET /admin/roles
 * POST /admin/roles
 * GET /admin/roles/:id
 * PUT /admin/roles/:id
 * DELETE /admin/roles/:id
 */

import { Router } from 'express';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';
import {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../controllers/role-controller';

const router = Router();

router.get('/', jwtAuth, requireAdmin, listRoles);
router.post('/', jwtAuth, requireAdmin, createRole);
router.get('/:id', jwtAuth, requireAdmin, getRoleById);
router.put('/:id', jwtAuth, requireAdmin, updateRole);
router.delete('/:id', jwtAuth, requireAdmin, deleteRole);

export default router;
