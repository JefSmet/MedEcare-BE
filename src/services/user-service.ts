/**
 * @description
 * Provides data access operations for User entities using Prisma.
 *
 * Key features:
 * - createUser: Creates a new user with a hashed password, attaches roles, and links to Person
 * - findByEmail: Finds a user by their email address
 * - updatePassword: Updates a user's password with a new hashed password
 * - findByResetToken: Retrieves a user by their reset token (for password reset flows)
 * - findById: Retrieves a user by its primary key (id)
 * - findAllUsers: Retrieves all user records (admin usage)
 * - updateUser: Updates arbitrary fields of a user (email, password, etc.)
 * - deleteUser: Removes a user record entirely
 *
 * @dependencies
 * - PrismaClient from '@prisma/client'
 * - bcrypt for secure password hashing
 *
 * @notes
 * - The schema now includes a mandatory `personId` referencing Person.
 * - Roles are attached via a many-to-many relationship with Role.
 * - We flatten user roles into user.roles in the passport strategies.
 */

import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface CreateUserParams {
  email: string;
  password: string;
  role?: string;  // e.g. 'ADMIN' or 'USER'
  personId?: string; // If the Person record is pre-created, pass it here
}

export async function createUser({
  email,
  password,
  role,
  personId,
}: CreateUserParams): Promise<User> {
  try {
    // We must have a personId or create a new Person
    let finalPersonId = personId;
    if (!finalPersonId) {
      // Create a minimal Person record
      const newPerson = await prisma.person.create({
        data: {
          firstName: '',
          lastName: '',
          dateOfBirth: new Date(), // Add the missing required field
        },
      });
      finalPersonId = newPerson.id;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Attempt to connect to the role or default to 'USER'
    // We'll look up the role by name. If not found, you can decide to create it or throw an error.
    let connectRoleData = [];
    let roleName = role || 'USER';

    const foundRole = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!foundRole) {
      // You can decide to create the role or throw an error. 
      // For demonstration, let's throw an error:
      throw new Error(`Role "${roleName}" not found in the database.`);
      // Alternatively, you could do:
      // const createdRole = await prisma.role.create({ data: { name: roleName }});
      // connectRoleData = [{ roleId: createdRole.id }];
    } else {
      connectRoleData = [
        {
          roleId: foundRole.id,
        },
      ];
    }

    // Create user with the chosen Person ID
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        personId: finalPersonId,
        userRoles: {
          create: connectRoleData,
        },
      },
    });

    return newUser;
  } catch (error: any) {
    // Unique constraint violation on email
    if (error.code === 'P2002') {
      throw new Error(`User with email ${email} already exists.`);
    }
    throw error;
  }
}

export async function findByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    throw error;
  }
}

export async function updatePassword(
  userId: string,
  newPassword: string,
): Promise<User> {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return updatedUser;
  } catch (error: any) {
    throw error;
  }
}

export async function findByResetToken(token: string): Promise<User | null> {
  try {
    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    });
    return user;
  } catch (error) {
    throw error;
  }
}

export async function findById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    throw error;
  }
}

export async function findAllUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    throw error;
  }
}

/**
 * @function updateUser
 * @description Updates a user's fields. 
 * Because roles are stored in a separate table (UserRole), 
 * we won't handle them here unless you specifically want to remove or add roles.
 */
export async function updateUser(
  userId: string,
  data: Partial<User>,
): Promise<User> {
  try {
    // Password hashing if data.password is present could be done here.
    // For now, we assume a separate function handles password changes.
    const { password: plainPassword, ...rest } = data;

    let updateData: any = { ...rest, updatedAt: new Date() };

    if (plainPassword) {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      updateData.password = hashedPassword;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    return updated;
  } catch (error: any) {
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<User> {
  try {
    const deleted = await prisma.user.delete({
      where: { id: userId },
    });
    return deleted;
  } catch (error: any) {
    throw error;
  }
}

