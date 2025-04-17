/**
 * @description
 * Defineert alle routes voor beheerfuncties die alleen voor 'ADMIN' zijn bedoeld:
 * lijst van gebruikers, aanmaken, updaten, verwijderen.
 *
 * @openapi
 * tags:
 *   name: Admin
 *   description: Admin endpoints voor user management
 */

import { Router } from 'express';
import {
  createNewUser,
  deleteExistingUser,
  listUsers,
  updateExistingUser,
} from '../controllers/admin-controller';
import { jwtAuth } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/role-middleware';

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: Haal alle gebruikers op
 *     tags: [Admin]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Lijst van gebruikers
 *   post:
 *     summary: Maak een nieuwe gebruiker aan
 *     tags: [Admin]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gebruiker succesvol aangemaakt
 *
 * /admin/users/{id}:
 *   put:
 *     summary: Update een bestaande gebruiker
 *     tags: [Admin]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gebruiker geüpdatet
 *       404:
 *         description: Gebruiker niet gevonden
 *   delete:
 *     summary: Verwijder een gebruiker
 *     tags: [Admin]
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
 *         description: Verwijdering voltooid
 *       404:
 *         description: Gebruiker niet gevonden
 */
const router = Router();

router.get('/users', jwtAuth, requireAdmin, listUsers);
router.post('/users', jwtAuth, requireAdmin, createNewUser);
router.put('/users/:id', jwtAuth, requireAdmin, updateExistingUser);
router.delete('/users/:id', jwtAuth, requireAdmin, deleteExistingUser);

export default router;
