/**
 * @description
 * Provides data access operations for User entities using Prisma.
 *
 * Key features:
 * - createUser: Creates a new user with a hashed password, attaches roles, and links to Person
 * - findByEmail: Finds a user by their email address
 * - updatePassword: Updates a user's password with a new hashed password
 * - findByResetToken: Retrieves a user by their reset token (for password reset flows)
 * - findById: Retrieves a user by its primary key (personId)
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

import { Person, PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface CreateUserParams {
  email: string;
  password: string;
  role?: string; // e.g. 'ADMIN' or 'USER'
  personId?: string; // If the Person record is pre-created, pass it here
}

export async function createUser({
  email,
  password,
  role,
  personId,
}: CreateUserParams): Promise<User> {
  try {
    // Require a personId to be provided
    if (!personId) {
      throw new Error('A personId must be provided to create a user.');
    }

    // Verify that the person exists
    const existingPerson = await prisma.person.findUnique({
      where: { id: personId },
    });

    if (!existingPerson) {
      throw new Error(`Person with ID ${personId} not found.`);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Attempt to connect to the role or default to 'USER'
    let connectRoleData = [];
    let roleName = role || 'USER';

    const foundRole = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!foundRole) {
      // For demonstration, we throw an error if role not found:
      throw new Error(`Role "${roleName}" not found in the database.`);
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
        personId: personId, // same value for PK and foreign key
        email,
        password: hashedPassword,
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
      where: { personId: userId }, // changed from id -> personId
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

export async function findById(
  id: string,
): Promise<(User & { roles: string[]; person: Person }) | null> {
  const user = await prisma.user.findUnique({
    where: { personId: id },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
      person: true, // Include the Person record if needed
    },
  });

  if (!user) return null;

  // Add roles array to user object
  return {
    ...user,
    roles: user.userRoles.map((ur) => ur.role.name),
  };
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
 * @function findAllUsersWithPersonDetails
 * @description Retrieves all users with their associated person details
 * @returns Promise with array of users including person details
 */
export async function findAllUsersWithPersonDetails(): Promise<
  (User & { person: Person })[]
> {
  try {
    const users = await prisma.user.findMany({
      include: {
        person: true,
      },
    });
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
    const { password: plainPassword, ...rest } = data;
    let updateData: any = { ...rest, updatedAt: new Date() };

    if (plainPassword) {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      updateData.password = hashedPassword;
    }

    const updated = await prisma.user.update({
      where: { personId: userId }, // changed from id -> personId
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
      where: { personId: userId }, // changed from id -> personId
    });
    return deleted;
  } catch (error: any) {
    throw error;
  }
}

/**
 * @function findUserById
 * @description Retrieves a single user by ID with their associated person details
 * @param userId The ID of the user to retrieve
 * @returns Promise with user including person details or null if not found
 */
export async function findUserById(
  userId: string,
): Promise<(User & { person: Person }) | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { personId: userId },
      include: {
        person: true,
      },
    });
    return user;
  } catch (error) {
    throw error;
  }
}
