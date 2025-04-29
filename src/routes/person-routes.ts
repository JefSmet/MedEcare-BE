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
 * tags:
 *   name: Person
 *   description: CRUD endpoints for Persons
 *
 * /admin/persons:
 *   get:
 *     summary: List all persons
 *     tags: [Person]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: List of persons
 *   post:
 *     summary: Create a new person
 *     tags: [Person]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - dateOfBirth
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: The newly created person
 *
 * /admin/persons/{id}:
 *   get:
 *     summary: Retrieve a person
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
 *         description: The requested person
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a person
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
 *         description: The updated person
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a person
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
 *         description: Deletion successful
 *       404:
 *         description: Not found
 */
router.get('/', jwtAuth, requireAdmin, listPersons);
router.post('/', jwtAuth, requireAdmin, createPerson);
router.get('/:id', jwtAuth, requireAdmin, getPersonById);
router.put('/:id', jwtAuth, requireAdmin, updatePerson);
router.delete('/:id', jwtAuth, requireAdmin, deletePerson);

export default router;
