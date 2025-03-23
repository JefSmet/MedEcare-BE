/**
 * @description
 * Defines routes for Person CRUD, protected by admin role.
 *
 * Endpoints:
 * GET /admin/persons
 * POST /admin/persons
 * GET /admin/persons/:id
 * PUT /admin/persons/:id
 * DELETE /admin/persons/:id
 *
 * @dependencies
 * - express: Router
 * - person-controller: the CRUD logic
 * - jwtAuth, requireAdmin: security middlewares
 */

import { Router } from 'express';
import {
  createPerson,
  deletePerson,
  getPersonById,
  listPersons,
  updatePerson,
} from '../controllers/person-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

// All routes require JWT auth + admin role
router.get('/', jwtAuth, requireAdmin, listPersons);
router.post('/', jwtAuth, requireAdmin, createPerson);
router.get('/:id', jwtAuth, requireAdmin, getPersonById);
router.put('/:id', jwtAuth, requireAdmin, updatePerson);
router.delete('/:id', jwtAuth, requireAdmin, deletePerson);

export default router;
