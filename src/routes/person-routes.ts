/**
 * @description
 * Defines routes for Person CRUD, protected by admin role.
 *
 * @openapi
 * tags:
 *   name: Person
 *   description: CRUD endpoints for Persons
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
 *     summary: List all persons
 *     tags: [Person]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of persons.
 *   post:
 *     summary: Create a new person
 *     tags: [Person]
 *     security:
 *       - BearerAuth: []
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
 *         description: The newly created Person.
 *
 * /admin/persons/{id}:
 *   get:
 *     summary: Get person by ID
 *     tags: [Person]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The Person ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the requested person.
 *       404:
 *         description: Person not found.
 *   put:
 *     summary: Update a person
 *     tags: [Person]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The Person ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
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
 *         description: The updated Person.
 *       404:
 *         description: Person not found.
 *   delete:
 *     summary: Delete a person
 *     tags: [Person]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The Person ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deletion message.
 *       404:
 *         description: Person not found.
 */

router.get('/', jwtAuth, requireAdmin, listPersons);
router.post('/', jwtAuth, requireAdmin, createPerson);
router.get('/:id', jwtAuth, requireAdmin, getPersonById);
router.put('/:id', jwtAuth, requireAdmin, updatePerson);
router.delete('/:id', jwtAuth, requireAdmin, deletePerson);

export default router;
