import { Router } from 'express';
import {
  listDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  listEnabledDoctors,
} from '../controllers/doctor-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Doctor
 *     description: Endpoints for managing doctors
 *
 * /admin/doctors:
 *   get:
 *     summary: List all doctors
 *     tags: [Doctor]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: List of all doctors with person details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 *   post:
 *     summary: Create a new doctor
 *     tags: [Doctor]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorRequestBody'
 *     responses:
 *       201:
 *         description: The newly created doctor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       400:
 *         description: Bad request - Person not found or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *
 * /admin/doctors/enabled:
 *   get:
 *     summary: List all doctors enabled for shifts
 *     tags: [Doctor]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: List of doctors enabled for shifts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 *
 * /admin/doctors/{id}:
 *   get:
 *     summary: Retrieve a doctor by person ID
 *     tags: [Doctor]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The person ID of the doctor
 *     responses:
 *       200:
 *         description: The requested doctor with full person details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *   put:
 *     summary: Update an existing doctor
 *     tags: [Doctor]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The person ID of the doctor
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rizivNumber:
 *                 type: string
 *                 description: Belgian RIZIV number (11 characters)
 *               isEnabledInShifts:
 *                 type: boolean
 *                 description: Whether the doctor is enabled for shift planning
 *     responses:
 *       200:
 *         description: The updated doctor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: Doctor not found
 *   delete:
 *     summary: Delete a doctor
 *     tags: [Doctor]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The person ID of the doctor
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
 *         description: Doctor not found
 */

router.get('/', jwtAuth, requireAdmin, listDoctors);
router.get('/enabled', jwtAuth, requireAdmin, listEnabledDoctors);
router.get('/:id', jwtAuth, requireAdmin, getDoctorById);
router.post('/', jwtAuth, requireAdmin, createDoctor);
router.put('/:id', jwtAuth, requireAdmin, updateDoctor);
router.delete('/:id', jwtAuth, requireAdmin, deleteDoctor);

export default router;
