/**
 * @description
 * The Auth Controller file handles authentication-related endpoints such as
 * user registration, login, token refresh, password reset, etc.
 *
 * Key changes:
 * - login: plaatst nu accessToken en refreshToken in HttpOnly cookies
 * - refreshToken: leest refreshToken uit cookie, genereert nieuwe token, zet opnieuw in cookie
 * - logout: wist de refreshToken-cookie
 *
 * @notes
 * - We verwijderen (grotendeels) de tokens uit de JSON-response.
 * - De cookie-instellingen gebruiken { httpOnly: true, secure, sameSite }.
 */

import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

import {
  findRefreshToken,
  removeRefreshToken,
  storeRefreshToken,
  storeResetToken,
} from "../services/auth-service";
import { sendResetEmail } from "../services/email-service";
import {
  createUser,
  findByEmail,
  findByResetToken,
  updatePassword,
  findById,
} from "../services/user-service";
import { isPasswordValid } from "../utils/password-validator";
import { generateTokens } from "../utils/token-utils";

interface RegisterRequestBody {
  email?: string;
  password?: string;
  role?: string;
  personId?: string;
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, role, personId } = req.body as RegisterRequestBody;

    if (!email || !password) {
      res.status(400).json({
        error: "Email en wachtwoord zijn verplichte velden.",
      });
      return;
    }

    if (!isPasswordValid(password)) {
      res.status(400).json({
        error: "Wachtwoord voldoet niet aan het vereiste sterktebeleid.",
      });
      return;
    }

    const newUser = await createUser({ email, password, role, personId });

    res.status(201).json({
      message: "Registratie succesvol.",
      user: {
        id: newUser.id,
        email: newUser.email,
        personId: newUser.personId,
      },
    });
  } catch (error: any) {
    next(error);
  }
}

interface LoginRequestBody {
  email?: string;
  password?: string;
  platform?: "web" | "mobile" | "web-persist";
}

export function login(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate("local", async (err: any, user: any, info: any) => {
    if (err) {
      next(err);
      return;
    }
    if (!user) {
      res.status(401).json({ error: info?.message || "Invalid credentials." });
      return;
    }

    try {
      const { platform = "web" } = req.body as LoginRequestBody;
      const tokens = generateTokens(user, platform);

      // Sla refresh token op in DB
      const refreshExpireDays =
        platform === "mobile" ? 30 : platform === "web-persist" ? 30 : 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + refreshExpireDays);

      await storeRefreshToken(user.id, tokens.refreshToken, expiresAt);

      // Zet tokens in HttpOnly cookies
      const isProd = process.env.NODE_ENV === "production";
      const cookieOptions = {
        httpOnly: true, // This ensures cookies remain HttpOnly
        secure: isProd,
        sameSite: "strict" as "strict",
      };

      // Voor web-persist (remember me), voeg maxAge toe aan de cookies
      // zonder de httpOnly instelling te wijzigen
      if (platform === "web-persist") {
        const maxAgeDays = 30; // 30 dagen bewaren
        const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
        Object.assign(cookieOptions, { maxAge: maxAgeMs });
      }

      res.cookie("accessToken", tokens.accessToken, cookieOptions);
      res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

      // Stuur enkel wat basisinfo terug
      res.status(200).json({
        message: "Login succesvol.",
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles,
          personId: user.personId,
        },
      });
    } catch (tokenError) {
      next(tokenError);
    }
  })(req, res, next);
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Haal de refreshToken uit de HttpOnly cookie
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(400).json({ error: "Geen refreshToken cookie aanwezig." });
      return;
    }

    const secret = process.env.JWT_SECRET || "changeme";
    let payload: any;

    try {
      payload = jwt.verify(refreshToken, secret);
    } catch (verifyError) {
      res.status(401).json({ error: "Invalid of verlopen refresh token." });
      return;
    }

    const existingRefresh = await findRefreshToken(refreshToken);
    if (!existingRefresh) {
      res
        .status(404)
        .json({ error: "Refresh token niet gevonden of al ongeldig gemaakt." });
      return;
    }

    if (existingRefresh.expiresAt < new Date()) {
      await removeRefreshToken(refreshToken);
      res.status(401).json({ error: "Refresh token is verlopen." });
      return;
    }

    // Oude refresh token wissen in DB (one-time usage)
    await removeRefreshToken(refreshToken);

    const userId = payload.id;
    const { platform = "web" } = req.body; // Optioneel als je `platform` wilt blijven doorgeven
    const newTokens = generateTokens({ id: userId } as any, platform);

    const refreshExpireDays = platform === "mobile" ? 30 : 7;
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + refreshExpireDays);

    await storeRefreshToken(userId, newTokens.refreshToken, newExpiresAt);

    // Zet nieuwe tokens in cookies
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("accessToken", newTokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
    });
    res.cookie("refreshToken", newTokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Tokens succesvol vernieuwd.",
    });
  } catch (error: any) {
    next(error);
  }
}

interface ForgotPasswordRequestBody {
  email?: string;
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body as ForgotPasswordRequestBody;
    if (!email) {
      res
        .status(400)
        .json({ error: "Email is required to request password reset." });
      return;
    }

    const user = await findByEmail(email);
    if (!user) {
      res
        .status(404)
        .json({ error: "No user found with the given email address." });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await storeResetToken(user.id, resetToken, expiresAt);

    const resetLink = `https://your-frontend-app.com/reset-password?token=${resetToken}`;
    await sendResetEmail(user.email, resetLink);

    res.status(200).json({
      message:
        "Reset instructions sent to the provided email address (if valid).",
    });
  } catch (error: any) {
    next(error);
  }
}

interface ResetPasswordRequestBody {
  token?: string;
  newPassword?: string;
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token, newPassword } = req.body as ResetPasswordRequestBody;

    if (!token || !newPassword) {
      res.status(400).json({
        error:
          'Both "token" and "newPassword" fields are required to reset the password.',
      });
      return;
    }

    const user = await findByResetToken(token);
    if (!user) {
      res.status(404).json({ error: "Invalid or unknown reset token." });
      return;
    }

    if (!user.resetExpire || user.resetExpire < new Date()) {
      res.status(400).json({
        error: "This reset token has expired. Please request a new one.",
      });
      return;
    }

    if (!isPasswordValid(newPassword)) {
      res.status(400).json({
        error: "New password does not meet the required strength policy.",
      });
      return;
    }

    await updatePassword(user.id, newPassword);
    await storeResetToken(user.id, "", new Date(0));

    res.status(200).json({
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (error: any) {
    next(error);
  }
}

interface ChangePasswordRequestBody {
  oldPassword?: string;
  newPassword?: string;
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userFromJwt = req.user as { id: string } | undefined;
    if (!userFromJwt || !userFromJwt.id) {
      res.status(401).json({ error: "Unauthorized or invalid token." });
      return;
    }

    const { oldPassword, newPassword } = req.body as ChangePasswordRequestBody;
    if (!oldPassword || !newPassword) {
      res.status(400).json({
        error: 'Both "oldPassword" and "newPassword" fields are required.',
      });
      return;
    }

    const dbUser = await findById(userFromJwt.id);
    if (!dbUser) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const bcrypt = require("bcrypt");
    const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isMatch) {
      res.status(401).json({ error: "Old password is incorrect." });
      return;
    }

    if (!isPasswordValid(newPassword)) {
      res
        .status(400)
        .json({ error: "New password does not meet strength requirements." });
      return;
    }

    await updatePassword(dbUser.id, newPassword);

    res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error: any) {
    next(error);
  }
}

interface LogoutRequestBody {
  refreshToken?: string;
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Haal de refreshToken uit de cookie
    const refreshToken = req.cookies?.refreshToken;

    // In alle gevallen clearen we de cookie in de response
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
    });

    if (!refreshToken) {
      // Als er geen refreshToken cookie was, is de logout ook in orde
      res.status(200).json({
        message: "Logout succesvol (geen token aanwezig).",
      });
      return;
    }

    try {
      await removeRefreshToken(refreshToken);
      res.status(200).json({
        message: "Logout succesvol. Refresh token ongeldig gemaakt.",
      });
    } catch (removeError: any) {
      if (removeError.code === "P2025") {
        // Token bestond niet in DB
        res.status(200).json({
          message: "Logout succesvol. Token stond niet (meer) in DB.",
        });
      } else {
        throw removeError;
      }
    }
  } catch (error: any) {
    next(error);
  }
}
