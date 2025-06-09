/**
 * @description
 * Doctor Controller manages CRUD operations for the 'Doctor' model.
 *
 * Key features:
 * - listDoctors: Retrieve all Doctor records with person details
 * - getDoctorById: Retrieve a single Doctor by personId
 * - createDoctor: Create a new Doctor (linked to existing Person)
 * - updateDoctor: Update an existing Doctor
 * - deleteDoctor: Remove a Doctor by personId
 *
 * @dependencies
 * - PrismaClient: used for DB queries
 *
 * @notes
 * - Doctor has a 1:1 relationship with Person via personId
 * - personId serves as both foreign key and primary key for Doctor
 */

import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export async function listDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        person: {
          include: {
            user: true,
          },
        },
      },
    });
    res.json(doctors);
  } catch (error) {
    next(error);
  }
}

export async function getDoctorById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({
      where: { personId: id },
      include: {
        person: {
          include: {
            user: true,
            activities: true,
            userConstraints: true,
          },
        },
      },
    });
    
    if (!doctor) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }
    
    res.json(doctor);
  } catch (error) {
    next(error);
  }
}

export async function createDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { personId, rizivNumber, isEnabledInShifts } = req.body;
    
    // Check if person exists
    const existingPerson = await prisma.person.findUnique({
      where: { id: personId },
    });
    
    if (!existingPerson) {
      res.status(400).json({ error: 'Person not found' });
      return;
    }
    
    const newDoctor = await prisma.doctor.create({
      data: {
        personId,
        rizivNumber,
        isEnabledInShifts: isEnabledInShifts ?? true,
      },
      include: {
        person: true,
      },
    });
    
    res.status(201).json(newDoctor);
  } catch (error) {
    next(error);
  }
}

export async function updateDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { rizivNumber, isEnabledInShifts } = req.body;

    const updated = await prisma.doctor.update({
      where: { personId: id },
      data: {
        ...(rizivNumber !== undefined && { rizivNumber }),
        ...(isEnabledInShifts !== undefined && { isEnabledInShifts }),
      },
      include: {
        person: true,
      },
    });
    
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.doctor.delete({ where: { personId: id } });
    res.json({ message: `Doctor with personId ${id} deleted.` });
  } catch (error) {
    next(error);
  }
}

export async function listEnabledDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isEnabledInShifts: true },
      include: {
        person: true,
      },
    });
    res.json(doctors);
  } catch (error) {
    next(error);
  }
}
