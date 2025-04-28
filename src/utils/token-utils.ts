/**
 * @description
 * A utility module for generating JWT access and refresh tokens.
 *
 * Key features:
 * - generateTokens: Generates both accessToken and refreshToken using different expirations
 *   for web and mobile platforms.
 *
 * @dependencies
 * - jsonwebtoken: For signing JWT tokens
 *
 * @notes
 * - Access Token Expirations:
 *   - Web: 1 hour
 *   - Mobile: 24 hours
 * - Refresh Token Expirations:
 *   - Web: 7 days
 *   - Mobile: 30 days
 * - The user payload is minimal (only user.id) to reduce token size.
 * - In future steps, we may store refresh tokens in the database for revocation or blacklisting.
 */

import { User } from '@prisma/client';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * @function generateTokens
 * @description Generates a pair of JWT tokens (access + refresh) with different expiration times
 * depending on whether the user is on web or mobile.
 *
 * @param {User} user - The user object (from DB) that must contain at least { id: string }
 * @param {string} platform - Either 'web', 'mobile', or 'web-persist'. Defaults to 'web' if not provided.
 *
 * @returns {TokenPair} An object containing { accessToken, refreshToken }
 *
 * @example
 *   const tokens = generateTokens(user, 'mobile');
 *   console.log(tokens.accessToken); // <JWT token>
 *   console.log(tokens.refreshToken); // <JWT token>
 */
export function generateTokens(user: User, platform: string): TokenPair {
  // Hard-coded expiry times per the technical requirements
  let accessExp = process.env.ACCESS_TOKEN_EXPIRY_WEB; // default for web
  let refreshExp = process.env.REFRESH_TOKEN_EXPIRY_WEB; // default for web

  if (platform === 'mobile') {
    accessExp = process.env.ACCESS_TOKEN_EXPIRY_MOBILE;
    refreshExp = process.env.REFRESH_TOKEN_EXPIRY_MOBILE;
  } else if (platform === 'web-persist') {
    // For web-persist (remember me), we use the same refresh token configuration as mobile
    accessExp = process.env.ACCESS_TOKEN_EXPIRY_WEB; // stays the same as web for the access token
    refreshExp = process.env.REFRESH_TOKEN_EXPIRY_MOBILE; // longer refresh, like mobile
  }

  const secret = process.env.JWT_SECRET || ('changeme' as Secret); // Fallback for dev/test

  // Payload includes only the user ID, per best practice
  const payload = { id: user.personId };

  // Generate Access Token
  const accessToken = jwt.sign(payload, secret, {
    expiresIn: accessExp,
  } as SignOptions);

  // Generate Refresh Token
  const refreshToken = jwt.sign(payload, secret, {
    expiresIn: refreshExp,
  } as SignOptions);

  return {
    accessToken,
    refreshToken,
  };
}
