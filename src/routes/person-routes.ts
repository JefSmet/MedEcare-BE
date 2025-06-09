import { Router } from 'express';
import {
  createPerson,
  deletePerson,
  getPersonById,
  listPersons,
  updatePerson,
  listStaff,
} from '../controllers/person-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Person
 *     description: CRUD endpoints for Person entities
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SimplePersonResponse'
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
 *             $ref: '#/components/schemas/PersonRequestBody'
 *     responses:
 *       201:
 *         description: Person created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonResponse'
 *
 * /admin/persons/{id}:
 *   get:
 *     summary: Get a person by ID
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
 *         description: Person details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonResponse'
 *       404:
 *         description: Person not found
 *
 *   put:
 *     summary: Update a person by ID
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PersonRequestBody'
 *     responses:
 *       200:
 *         description: Person updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonResponse'
 *
 *   delete:
 *     summary: Delete a person by ID
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
 *         description: Person deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 * /admin/persons/staff:
 *   get:
 *     summary: List all doctors enabled for shifts
 *     tags: [Person]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: List of doctors with person details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   personId:
 *                     type: string
 *                   rizivNumber:
 *                     type: string
 *                   isEnabledInShifts:
 *                     type: boolean
 *                   person:
 *                     $ref: '#/components/schemas/SimplePersonResponse'
 */

router.get('/', jwtAuth, requireAdmin, listPersons);
router.get('/staff', jwtAuth, requireAdmin, listStaff);
router.post('/', jwtAuth, requireAdmin, createPerson);
router.get('/:id', jwtAuth, requireAdmin, getPersonById);
router.put('/:id', jwtAuth, requireAdmin, updatePerson);
router.delete('/:id', jwtAuth, requireAdmin, deletePerson);

export default router;
