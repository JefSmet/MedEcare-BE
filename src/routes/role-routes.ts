/**
 * @description
 * Routes voor Role-CRUD, alleen admin.
 *
 * @openapi
 * tags:
 *   name: Role
 *   description: Endpoints voor het beheren van rollen
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

/**
 * @openapi
 * /admin/roles:
 *   get:
 *     summary: Lijst alle rollen
 *     tags: [Role]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Overzicht van alle rollen
 *   post:
 *     summary: Maak een nieuwe rol aan
 *     tags: [Role]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Nieuw aangemaakte rol
 *
 * /admin/roles/{id}:
 *   get:
 *     summary: Haal een rol op
 *     tags: [Role]
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
 *         description: De gevraagde rol
 *       404:
 *         description: Niet gevonden
 *   put:
 *     summary: Update een rol
 *     tags: [Role]
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: De geüpdatete rol
 *       404:
 *         description: Niet gevonden
 *   delete:
 *     summary: Verwijder een rol
 *     tags: [Role]
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
 *         description: Verwijdering gelukt
 *       404:
 *         description: Niet gevonden
 */
const router = Router();

router.get('/', jwtAuth, requireAdmin, listRoles);
router.post('/', jwtAuth, requireAdmin, createRole);
router.get('/:id', jwtAuth, requireAdmin, getRoleById);
router.put('/:id', jwtAuth, requireAdmin, updateRole);
router.delete('/:id', jwtAuth, requireAdmin, deleteRole);

export default router;
