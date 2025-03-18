/**
 * @description
 * Provides data access operations for RefreshToken entities using Prisma.
 *
 * Key features:
 * - storeRefreshToken: Saves a new refresh token in the database
 * - findRefreshToken: Looks up a refresh token by token string
 * - removeRefreshToken: Deletes a refresh token from the database
 *
 * @dependencies
 * - PrismaClient from '@prisma/client': For database interactions
 *
 * @notes
 * - This service encapsulates logic for storing and managing refresh tokens in the DB.
 * - The token is stored in plain text for simplicity; production systems may choose to hash it.
 * - The single-use approach means we remove used or expired tokens to prevent reuse.
 */

import { PrismaClient, RefreshToken } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @function storeRefreshToken
 * @description Stores a refresh token in the database
 * @param {string} userId - The unique ID of the user
 * @param {string} token - The refresh token string (JWT)
 * @param {Date} expiresAt - The date/time when the token expires
 * @returns {Promise<RefreshToken>} - A promise resolving to the stored RefreshToken record
 *
 * @example
 *   const newToken = await storeRefreshToken("user-id", "jwt-token-here", new Date("2025-12-31"));
 */
export async function storeRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<RefreshToken> {
  try {
    const record = await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
    return record;
  } catch (error) {
    throw error;
  }
}

/**
 * @function findRefreshToken
 * @description Finds a refresh token record by its token string
 * @param {string} token - The refresh token string (JWT)
 * @returns {Promise<RefreshToken | null>} - The found record or null if not found
 *
 * @example
 *   const existing = await findRefreshToken("jwt-token-here");
 *   if (existing) {
 *     console.log("Token found:", existing);
 *   }
 */
export async function findRefreshToken(
  token: string,
): Promise<RefreshToken | null> {
  try {
    const record = await prisma.refreshToken.findUnique({
      where: { token },
    });
    return record;
  } catch (error) {
    throw error;
  }
}

/**
 * @function removeRefreshToken
 * @description Removes a refresh token record from the database, invalidating it
 * @param {string} token - The refresh token string (JWT)
 * @returns {Promise<RefreshToken>} - The removed record, or an error if not found
 *
 * @example
 *   await removeRefreshToken("jwt-token-here");
 */
export async function removeRefreshToken(token: string): Promise<RefreshToken> {
  try {
    const deleted = await prisma.refreshToken.delete({
      where: { token },
    });
    return deleted;
  } catch (error) {
    // If token doesn't exist, Prisma will throw an error
    throw error;
  }
}
