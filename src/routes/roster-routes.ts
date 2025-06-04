import { Router } from 'express';
import {
  createRoster,
  deleteRoster,
  getRosterById,
  listRosters,
  updateRoster,
} from '../controllers/roster-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Roster
 *     description: Endpoints for managing rosters
 *
 * /admin/rosters:
 *   get:
 *     summary: List all rosters
 *     tags: [Roster]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Array of rosters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Roster'
 *   post:
 *     summary: Create a new roster
 *     tags: [Roster]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - shiftTypeId
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The roster ID (must be unique)
 *               shiftTypeId:
 *                 type: string
 *                 description: Reference to the shift type
 *     responses:
 *       201:
 *         description: The newly created roster
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Roster'
 *
 * /admin/rosters/{id}:
 *   get:
 *     summary: Retrieve a roster by ID
 *     tags: [Roster]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The requested roster
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Roster'
 *       404:
 *         description: Roster not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *   put:
 *     summary: Update an existing roster
 *     tags: [Roster]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shiftTypeId:
 *                 type: string
 *                 description: Reference to the shift type
 *     responses:
 *       200:
 *         description: The updated roster
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Roster'
 *       404:
 *         description: Roster not found
 *   delete:
 *     summary: Delete a roster
 *     tags: [Roster]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Roster not found
 */
router.get('/', jwtAuth, requireAdmin, listRosters);
router.post('/', jwtAuth, requireAdmin, createRoster);
router.get('/:id', jwtAuth, requireAdmin, getRosterById);
router.put('/:id', jwtAuth, requireAdmin, updateRoster);
router.delete('/:id', jwtAuth, requireAdmin, deleteRoster);

export default router;
