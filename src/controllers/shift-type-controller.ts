/**
 * @description
 * ShiftType Controller for CRUD on 'ShiftType'.
 *
 * Key features:
 * - listShiftTypes
 * - getShiftTypeById
 * - createShiftType
 * - updateShiftType
 * - deleteShiftType
 *
 * @notes
 * - The ShiftType rates are in another table (ShiftTypeRate).
 */

import prisma from '../prisma/client';
import { Request, Response, NextFunction } from 'express';

export async function listShiftTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const shiftTypes = await prisma.shiftType.findMany({
      include: { rates: true },
    });
    res.json(shiftTypes);
  } catch (error) {
    next(error);
  }
}

export async function getShiftTypeById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const shiftType = await prisma.shiftType.findUnique({
      where: { id },
      include: { rates: true },
    });
    if (!shiftType) {
      res.status(404).json({ error: 'ShiftType not found' });
      return;
    }
    res.json(shiftType);
  } catch (error) {
    next(error);
  }
}

export async function createShiftType(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      startHour,
      startMinute,
      durationMinutes,
      activeFrom,
      activeUntil,
    } = req.body;

    const newShiftType = await prisma.shiftType.create({
      data: {
        name,
        startHour,
        startMinute,
        durationMinutes,
        activeFrom: activeFrom ? new Date(activeFrom) : null,
        activeUntil: activeUntil ? new Date(activeUntil) : null,
      },
    });
    res.status(201).json(newShiftType);
  } catch (error) {
    next(error);
  }
}

export async function updateShiftType(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const {
      name,
      startHour,
      startMinute,
      durationMinutes,
      activeFrom,
      activeUntil,
    } = req.body;

    const updated = await prisma.shiftType.update({
      where: { id },
      data: {
        name,
        startHour,
        startMinute,
        durationMinutes,
        activeFrom: activeFrom ? new Date(activeFrom) : null,
        activeUntil: activeUntil ? new Date(activeUntil) : null,
      },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteShiftType(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.shiftType.delete({ where: { id } });
    res.json({ message: `ShiftType with ID ${id} deleted.` });
  } catch (error) {
    next(error);
  }
}
