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
 *
 * @dependencies
 * - PrismaClient from '@prisma/client': For database interactions
 * - bcrypt: For secure password hashing
 *
 * @notes
 * - Throws an error if a user with a given email already exists (unique constraint)
 * - Uses a default role of 'USER' if none is provided
 * - The findByResetToken method is newly introduced to aid the resetPassword controller
 * - The findById method is added to facilitate secure retrieval of user data (including hashed password)
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
 * @throws {Error} - Throws an error if the user email already exists or if a DB error occurs
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
    // Handle unique constraint violation (Prisma code 'P2002') or rethrow
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
 * @throws {Error} - Throws an error if the user cannot be found or if a DB error occurs
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
    // If user not found, Prisma will throw an error
    throw error;
  }
}

/**
 * @function findByResetToken
 * @description Retrieves a user record by their reset token.
 * @param {string} token - The reset token to search for in the 'resetToken' field
 * @returns {Promise<User|null>} - Returns the user if found; otherwise null
 *
 * @example
 *   const user = await findByResetToken("randomGeneratedTokenHere");
 *   if (user) {
 *     console.log("User who requested reset: ", user.email);
 *   }
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
 *     console.log("Found user with email:", user.email);
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
