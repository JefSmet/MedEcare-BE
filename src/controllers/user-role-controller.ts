/**
 * @description
 * UserRole Controller manages CRUD operations for the 'UserRole' model.
 * This is a many-to-many relationship between User and Role.
 *
 * Key features:
 * - listUserRoles: Retrieve all UserRole assignments
 * - getUserRolesByUserId: Get all roles for a specific user
 * - getRolesByUserId: Get simplified roles list for a user
 * - createUserRole: Assign a role to a user
 * - deleteUserRole: Remove a role assignment from a user
 * - getUsersByRoleId: Get all users with a specific role
 *
 * @dependencies
 * - PrismaClient: used for DB queries
 *
 * @notes
 * - UserRole uses composite primary key [userId, roleId]
 * - userId references User.personId (not User.id)
 */

import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export async function listUserRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userRoles = await prisma.userRole.findMany({
      include: {
        user: {
          include: {
            person: true,
          },
        },
        role: true,
      },
    });
    res.json(userRoles);
  } catch (error) {
    next(error);
  }
}

export async function getUserRolesByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
        user: {
          include: {
            person: true,
          },
        },
      },
    });
    
    if (userRoles.length === 0) {
      res.status(404).json({ error: 'No roles found for this user' });
      return;
    }
    
    res.json(userRoles);
  } catch (error) {
    next(error);
  }
}

export async function getRolesByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    const roles = await prisma.role.findMany({
      where: {
        userRoles: {
          some: {
            userId,
          },
        },
      },
    });
    
    res.json(roles);
  } catch (error) {
    next(error);
  }
}

export async function getUsersByRoleId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roleId } = req.params;
    const userRoles = await prisma.userRole.findMany({
      where: { roleId },
      include: {
        user: {
          include: {
            person: true,
          },
        },
        role: true,
      },
    });
    
    res.json(userRoles);
  } catch (error) {
    next(error);
  }
}

export async function createUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, roleId } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { personId: userId },
    });
    
    if (!existingUser) {
      res.status(400).json({ error: 'User not found' });
      return;
    }
    
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
    });
    
    if (!existingRole) {
      res.status(400).json({ error: 'Role not found' });
      return;
    }
    
    // Check if assignment already exists
    const existingAssignment = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
    
    if (existingAssignment) {
      res.status(400).json({ error: 'User already has this role assigned' });
      return;
    }
    
    const newUserRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        user: {
          include: {
            person: true,
          },
        },
        role: true,
      },
    });
    
    res.status(201).json(newUserRole);
  } catch (error) {
    next(error);
  }
}

export async function deleteUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, roleId } = req.params;
    
    const existingAssignment = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
    
    if (!existingAssignment) {
      res.status(404).json({ error: 'User role assignment not found' });
      return;
    }
    
    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
    
    res.json({ message: `Role assignment removed for user ${userId} and role ${roleId}` });
  } catch (error) {
    next(error);
  }
}
