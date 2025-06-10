/**
 * @description
 * Roster Controller for CRUD on 'Roster'.
 * * Key features:
 * - listRosters: Return all rosters with their related ShiftType
 * - getRosterById: Return a single roster by ID
 * - createRoster: Clear entire roster table and populate with new collection
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
    const { rosters } = req.body;

    // Validate that rosters is an array
    if (!Array.isArray(rosters)) {
      res.status(400).json({ error: 'Request body must contain a "rosters" array' });
      return;
    }

    // Use transaction to ensure atomicity: first clear the table, then populate with new data
    const result = await prisma.$transaction(async (tx) => {
      // First, clear the entire roster table
      await tx.roster.deleteMany({});

      // Then, create all new rosters
      const createdRosters = await Promise.all(
        rosters.map(async (rosterData: { id: number; shiftTypeId: string }) => {
          return await tx.roster.create({
            data: {
              id: rosterData.id,
              shiftTypeId: rosterData.shiftTypeId,
            },
            include: {
              shiftType: true,
            },
          });
        })
      );

      return createdRosters;
    });

    res.status(201).json({
      message: `Roster table cleared and ${result.length} new rosters created`,
      rosters: result,
    });
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
