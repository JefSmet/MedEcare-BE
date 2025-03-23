/**
 * @description
 * Routes for UserConstraint CRUD, protected by admin role.
 *
 * Endpoints:
 * GET /admin/user-constraints
 * POST /admin/user-constraints
 * GET /admin/user-constraints/:id
 * PUT /admin/user-constraints/:id
 * DELETE /admin/user-constraints/:id
 */

import { Router } from 'express';
import {
  createUserConstraint,
  deleteUserConstraint,
  getUserConstraintById,
  listUserConstraints,
  updateUserConstraint,
} from '../controllers/user-constraint-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

router.get('/', jwtAuth, requireAdmin, listUserConstraints);
router.post('/', jwtAuth, requireAdmin, createUserConstraint);
router.get('/:id', jwtAuth, requireAdmin, getUserConstraintById);
router.put('/:id', jwtAuth, requireAdmin, updateUserConstraint);
router.delete('/:id', jwtAuth, requireAdmin, deleteUserConstraint);

export default router;
