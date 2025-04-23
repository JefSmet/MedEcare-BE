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

import { User } from "@prisma/client";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

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
 * @param {string} platform - Either 'web' or 'mobile'. Defaults to 'web' if not provided.
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
  let accessExp = "1h"; // default for web
  let refreshExp = "7d"; // default for web

  if (platform === "mobile") {
    accessExp = "24h";
    refreshExp = "30d";
  } else if (platform === "web-persist") {
    // Voor web-persist (remember me) gebruiken we dezelfde tokens als mobile
    accessExp = "1h"; // blijft hetzelfde als web
    refreshExp = "30d"; // langer bewaren, zoals mobile
  }

  const secret = process.env.JWT_SECRET || "changeme" as Secret; // Fallback for dev/test

  // Payload includes only the user ID, per best practice
  const payload = { id: user.id };

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
