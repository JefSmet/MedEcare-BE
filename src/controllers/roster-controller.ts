/**
 * @description
 * Roster Controller for CRUD on 'Roster'.
 *
 * Key features:
 * - listRosters: Return all rosters with their related ShiftType
 * - getRosterById: Return a single roster by ID
 * - createRoster: Create a new roster with shiftTypeId
 * - updateRoster: Update an existing roster
 * - deleteRoster: Remove a roster by ID
 *
 * @notes
 * - Each Roster is linked to a ShiftType via shiftTypeId.
 * - The ID field is an Int (auto-increment) instead of UUID.
 */

import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export async function listRosters(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rosters = await prisma.roster.findMany({
      include: {
        shiftType: true,
      },
    });
    res.json(rosters);
  } catch (error) {
    next(error);
  }
}

export async function getRosterById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const roster = await prisma.roster.findUnique({
      where: { id: parseInt(id) },
      include: {
        shiftType: true,
      },
    });
    if (!roster) {
      res.status(404).json({ error: 'Roster not found' });
      return;
    }
    res.json(roster);
  } catch (error) {
    next(error);
  }
}

export async function createRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id, shiftTypeId } = req.body;

    const newRoster = await prisma.roster.create({
      data: {
        id,
        shiftTypeId,
      },
      include: {
        shiftType: true,
      },
    });
    res.status(201).json(newRoster);
  } catch (error) {
    next(error);
  }
}

export async function updateRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { shiftTypeId } = req.body;

    const updated = await prisma.roster.update({
      where: { id: parseInt(id) },
      data: {
        shiftTypeId,
      },
      include: {
        shiftType: true,
      },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.roster.delete({ where: { id: parseInt(id) } });
    res.json({ message: `Roster with ID ${id} deleted.` });
  } catch (error) {
    next(error);
  }
}
