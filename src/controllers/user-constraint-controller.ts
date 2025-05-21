/**
 * @description
 * UserConstraint Controller for CRUD on 'UserConstraint'.
 *
 * Key features:
 * - listUserConstraints
 * - getUserConstraintById
 * - createUserConstraint
 * - updateUserConstraint
 * - deleteUserConstraint
 *
 * @notes
 * - This references personId. E.g., maximum shift constraints, etc.
 */

import prisma from '../prisma/client';
import { NextFunction, Request, Response } from 'express';

export async function listUserConstraints(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const constraints = await prisma.userConstraint.findMany({
      include: {
        person: true,
      },
    });
    res.json(constraints);
  } catch (error) {
    next(error);
  }
}

export async function getUserConstraintById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const constraint = await prisma.userConstraint.findUnique({
      where: { id },
      include: {
        person: true,
      },
    });
    if (!constraint) {
      res.status(404).json({ error: 'UserConstraint not found' });
      return;
    }
    res.json(constraint);
  } catch (error) {
    next(error);
  }
}

export async function createUserConstraint(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      personId,
      maxNightShiftsPerWeek,
      maxConsecutiveNightShifts,
      minRestHoursBetweenShifts,
    } = req.body;

    const newConstraint = await prisma.userConstraint.create({
      data: {
        personId,
        maxNightShiftsPerWeek,
        maxConsecutiveNightShifts,
        minRestHoursBetweenShifts,
      },
    });
    res.status(201).json(newConstraint);
  } catch (error) {
    next(error);
  }
}

export async function updateUserConstraint(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      personId,
      maxNightShiftsPerWeek,
      maxConsecutiveNightShifts,
      minRestHoursBetweenShifts,
    } = req.body;

    const updated = await prisma.userConstraint.update({
      where: { id },
      data: {
        personId,
        maxNightShiftsPerWeek,
        maxConsecutiveNightShifts,
        minRestHoursBetweenShifts,
      },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteUserConstraint(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.userConstraint.delete({ where: { id } });
    res.json({ message: `UserConstraint with ID ${id} deleted.` });
  } catch (error) {
    next(error);
  }
}
