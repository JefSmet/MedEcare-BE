/**
 * @description
 * Routes voor Person-CRUD, alleen voor admin.
 *
 * @openapi
 * tags:
 *   name: Person
 *   description: CRUD endpoints voor Persons
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

/**
 * @openapi
 * /admin/persons:
 *   get:
 *     summary: Lijst alle persons
 *     tags: [Person]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Lijst van personen
 *   post:
 *     summary: Maak een nieuwe person aan
 *     tags: [Person]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: De nieuw aangemaakte persoon
 *
 * /admin/persons/{id}:
 *   get:
 *     summary: Haal een persoon op
 *     tags: [Person]
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
 *         description: De gevraagde persoon
 *       404:
 *         description: Niet gevonden
 *   put:
 *     summary: Update een persoon
 *     tags: [Person]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: De geüpdatete persoon
 *       404:
 *         description: Niet gevonden
 *   delete:
 *     summary: Verwijder een persoon
 *     tags: [Person]
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
 *         description: Verwijdering is gelukt
 *       404:
 *         description: Niet gevonden
 */
router.get('/', jwtAuth, requireAdmin, listPersons);
router.post('/', jwtAuth, requireAdmin, createPerson);
router.get('/:id', jwtAuth, requireAdmin, getPersonById);
router.put('/:id', jwtAuth, requireAdmin, updatePerson);
router.delete('/:id', jwtAuth, requireAdmin, deletePerson);

export default router;
