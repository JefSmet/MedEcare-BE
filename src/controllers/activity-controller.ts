/**
 * @description
 * Activity Controller for CRUD on 'Activity'.
 *
 * Key features:
 * - listActivities
 * - getActivityById
 * - createActivity
 * - updateActivity
 * - deleteActivity
 *
 * @notes
 * - activityType can be 'SHIFT', 'LEAVE', 'CONFERENCE', etc.
 * - personId is required, shiftTypeId is optional if it's a SHIFT.
 */

import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

const prisma = new PrismaClient();

export async function listActivities(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        person: true,
        shiftType: true,
      },
    });
    res.json(activities);
  } catch (error) {
    next(error);
  }
}

export async function getActivityById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        person: true,
        shiftType: true,
      },
    });
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }
    res.json(activity);
  } catch (error) {
    next(error);
  }
}

export async function createActivity(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { activityType, start, end, personId, shiftTypeId } = req.body;
    const newActivity = await prisma.activity.create({
      data: {
        activityType,
        start: new Date(start),
        end: new Date(end),
        personId,
        shiftTypeId,
      },
    });
    res.status(201).json(newActivity);
  } catch (error) {
    next(error);
  }
}

export async function updateActivity(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const { activityType, start, end, personId, shiftTypeId } = req.body;

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        activityType,
        start: start ? new Date(start) : undefined,
        end: end ? new Date(end) : undefined,
        personId,
        shiftTypeId,
      },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteActivity(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.activity.delete({ where: { id } });
    res.json({ message: `Activity with ID ${id} deleted.` });
  } catch (error) {
    next(error);
  }
}
