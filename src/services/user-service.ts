/**
 * @description
 * Provides data access operations for User entities using Prisma.
 *
 * Key features:
 * - createUser: Creates a new user with a hashed password
 * - findByEmail: Finds a user by their email address
 * - updatePassword: Updates a user's password with a new hashed password
 * - findByResetToken: Retrieves a user by their reset token (for password reset flows)
 * - findById: Retrieves a user by their primary key (id)
 * - findAllUsers: Retrieves all user records (admin usage)
 * - updateUser: Updates arbitrary fields of a user (email, role, password, etc.)
 * - deleteUser: Removes a user record entirely
 *
 * @dependencies
 * - PrismaClient from '@prisma/client': For database interactions
 * - bcrypt: For secure password hashing
 *
 * @notes
 * - This module is used by both public-facing controllers (e.g., registration) and admin controllers.
 * - Password hashing is handled in createUser and updatePassword (or updateUser if we decide).
 * - The new findAllUsers, updateUser, and deleteUser are exclusively for Admin usage.
 */

import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * @function createUser
 * @description Creates a new user record in the database with a hashed password
 * @param {Object} params - The user registration parameters
 * @param {string} params.email - The user's email (must be unique)
 * @param {string} params.password - The user's plaintext password
 * @param {string} [params.role] - The user's role (optional; default is 'USER')
 * @returns {Promise<User>} - A promise that resolves to the newly created User object
 * @throws {Error} - Throws an error if a user with the given email already exists
 *
 * @example
 *   const user = await createUser({ email: "test@example.com", password: "StrongPass#1" });
 */
export async function createUser({
  email,
  password,
  role,
}: {
  email: string;
  password: string;
  role?: string;
}): Promise<User> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role ?? 'USER',
      },
    });

    return newUser;
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      throw new Error(`User with email ${email} already exists.`);
    }
    throw error;
  }
}

/**
 * @function findByEmail
 * @description Retrieves a user by their unique email address
 * @param {string} email - The email address to look up
 * @returns {Promise<User|null>} - A promise that resolves to the User object or null if not found
 *
 * @example
 *   const user = await findByEmail("test@example.com");
 *   if (user) {
 *     console.log("User found:", user);
 *   }
 */
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

/**
 * @function updatePassword
 * @description Updates the password of a given user
 * @param {string} userId - The unique identifier (id) of the user
 * @param {string} newPassword - The user's new plaintext password
 * @returns {Promise<User>} - A promise that resolves to the updated User object
 *
 * @example
 *   await updatePassword("some-user-id", "NewPass123!");
 */
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

/**
 * @function findByResetToken
 * @description Retrieves a user record by their reset token.
 * @param {string} token - The reset token to search for
 * @returns {Promise<User|null>} - Returns the user if found; otherwise null
 *
 * @example
 *   const user = await findByResetToken("randomGeneratedTokenHere");
 */
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

/**
 * @function findById
 * @description Retrieves a user record by its primary key (id).
 * @param {string} id - The unique user ID to look up
 * @returns {Promise<User | null>} - Returns the user if found; otherwise null
 *
 * @example
 *   const user = await findById("some-uuid");
 *   if (user) {
 *     console.log("Found user:", user.email);
 *   }
 */
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

/**
 * @function findAllUsers
 * @description Retrieves all user records from the database.
 * @returns {Promise<User[]>} - A promise that resolves to an array of User objects
 *
 * @example
 *  const users = await findAllUsers();
 *  console.log(users);
 */
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
 * @description Updates arbitrary fields for a given user. This is primarily used by Admin operations.
 * @param {string} userId - The ID of the user to update
 * @param {Object} data - Key-value pairs of fields to update (e.g., { email: 'newemail', role: 'ADMIN' })
 * @returns {Promise<User>} - Returns the updated user record
 *
 * @example
 *   const updated = await updateUser("user-id", { email: "new@example.com", role: "ADMIN" });
 */
export async function updateUser(
  userId: string,
  data: Partial<User>,
): Promise<User> {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return updated;
  } catch (error: any) {
    throw error;
  }
}

/**
 * @function deleteUser
 * @description Removes a user record by ID.
 * @param {string} userId - The ID of the user to delete
 * @returns {Promise<User>} - The record that was deleted
 *
 * @example
 *   const deleted = await deleteUser("user-id");
 *   console.log("User deleted:", deleted);
 */
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
