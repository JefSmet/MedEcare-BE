/**
 * @description
 * ShiftTypeRate Controller for CRUD on 'ShiftTypeRate'.
 *
 * Key features:
 * - listShiftTypeRates
 * - getShiftTypeRateById
 * - createShiftTypeRate
 * - updateShiftTypeRate
 * - deleteShiftTypeRate
 *
 * @notes
 * - Each ShiftTypeRate references a ShiftType by shiftTypeId.
 */

import prisma from '../prisma/client';
import { Request, Response, NextFunction } from 'express';

export async function listShiftTypeRates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const allRates = await prisma.shiftTypeRate.findMany({
      include: {
        shiftType: true,
      },
    });
    res.json(allRates);
  } catch (error) {
    next(error);
  }
}

export async function getShiftTypeRateById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const rate = await prisma.shiftTypeRate.findUnique({
      where: { id },
      include: { shiftType: true },
    });
    if (!rate) {
      res.status(404).json({ error: 'ShiftTypeRate not found' });
      return;
    }
    res.json(rate);
  } catch (error) {
    next(error);
  }
}

export async function createShiftTypeRate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { shiftTypeId, rate, validFrom, validUntil } = req.body;

    const newRate = await prisma.shiftTypeRate.create({
      data: {
        shiftTypeId,
        rate,
        validFrom: new Date(validFrom),
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });
    res.status(201).json(newRate);
  } catch (error) {
    next(error);
  }
}

export async function updateShiftTypeRate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { shiftTypeId, rate, validFrom, validUntil } = req.body;

    const updated = await prisma.shiftTypeRate.update({
      where: { id },
      data: {
        shiftTypeId,
        rate,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteShiftTypeRate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.shiftTypeRate.delete({ where: { id } });
    res.json({ message: `ShiftTypeRate with ID ${id} deleted.` });
  } catch (error) {
    next(error);
  }
}
