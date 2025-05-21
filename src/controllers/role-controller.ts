/**
 * @description
 * Role Controller for CRUD on the 'Role' model.
 *
 * Key features:
 * - listRoles: Return all roles
 * - getRoleById: Return a single role by ID
 * - createRole: Create a new role (e.g., "ADMIN")
 * - updateRole: Update the role name
 * - deleteRole: Remove a role by ID
 *
 * @notes
 * - Usually roles are quite static, but we have a full CRUD for demonstration.
 */

import prisma from '../prisma/client';
import { Request, Response, NextFunction } from 'express';

export async function listRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (error) {
    next(error);
  }
}

export async function getRoleById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }
    res.json(role);
  } catch (error) {
    next(error);
  }
}

export async function createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.body.toUpperCase();;
    const newRole = await prisma.role.create({
      data: { name },
    });
    res.status(201).json(newRole);
  } catch (error) {
    next(error);
  }
}

export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name } = req.body.toUpperCase();

    const updated = await prisma.role.update({
      where: { id },
      data: { name },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.role.delete({ where: { id } });
    res.json({ message: `Role with ID ${id} deleted.` });
  } catch (error) {
    next(error);
  }
}
