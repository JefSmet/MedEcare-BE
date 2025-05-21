/**
 * @description
 * Person Controller manages basic CRUD for the 'Person' model.
 *
 * Key features:
 * - listPersons: Retrieve all Person records
 * - getPersonById: Retrieve a single Person by ID
 * - createPerson: Create a new Person
 * - updatePerson: Update an existing Person
 * - deletePerson: Remove a Person by ID
 *
 * @dependencies
 * - PrismaClient: used for DB queries
 *
 * @notes
 * - This does NOT handle the linked 'User' model. 'User' is separate (with personId).
 * - For advanced usage, you might have join queries, etc.
 */

import prisma from '../prisma/client';
import { Request, Response, NextFunction } from 'express';

export async function listPersons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const persons = await prisma.person.findMany({
      include: {
        user: false,
        activities: false,
        userConstraints: false,
      },
    });
    res.json(persons);
  } catch (error) {
    next(error);
  }
}

export async function getPersonById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        user: true,
        activities: true,
        userConstraints: true,
      },
    });
    if (!person) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }
    res.json(person);
  } catch (error) {
    next(error);
  }
}

export async function createPerson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { firstName, lastName, dateOfBirth } = req.body;
    const newPerson = await prisma.person.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: dateOfBirth, // Remove default value to allow Prisma to throw error if missing
      },
    });
    res.status(201).json(newPerson);
  } catch (error) {
    next(error);
  }
}

export async function updatePerson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { firstName, lastName } = req.body;

    const updated = await prisma.person.update({
      where: { id },
      data: {
        firstName,
        lastName,
      },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deletePerson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.person.delete({ where: { id } });
    res.json({ message: `Person with ID ${id} deleted.` });
  } catch (error) {
    next(error);
  }
}
