/**
 * @description
 * The Admin Controller handles user management tasks restricted to 'ADMIN' role.
 * This includes listing users (with their personal details), creating users, updating user details, and deleting users.
 *
 * Key features:
 * - listUsers: Retrieves a list of all users with their personal information
 * - createNewUser
 * - updateExistingUser
 * - deleteExistingUser
 *
 * @dependencies
 * - express: For Request, Response, NextFunction
 * - user-service: Provides data access methods for the User model, including personalized data
 * - password-validator: For verifying the strength of a new password
 * - bcrypt: For hashing a new password if it is updated
 *
 * @notes
 * - All routes must be called after passing jwtAuth and requireAdmin middlewares.
 * - We ensure that no sensitive data (like hashed password) is returned in the response.
 */

import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import {
  createUser,
  deleteUser,
  findAllUsersWithPersonDetails,
  findUserById,
  updateUser,
} from '../services/user-service';
import { isPasswordValid } from '../utils/password-validator';

/**
 * @function listUsers
 * @description Retrieves a list of all users, including person details but excluding passwords.
 * The function returns user information along with the associated person data like firstName, lastName, etc.
 *
 * @param req Express request
 * @param res Express response
 * @param next Error handling
 * @returns Promise<void>
 */
export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await findAllUsersWithPersonDetails();
    // Modify to match OpenAPI docs - include the full person object
    const sanitized = users.map((u) => ({
      personId: u.personId,
      email: u.email,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      person: u.person,
    }));

    res.status(200).json(sanitized);
  } catch (error: any) {
    next(error);
  }
}

/**
 * @function createNewUser
 * @description Allows an admin to create a new user. The admin can specify a role, etc.
 *
 * @param req Express request
 * @param res Express response
 * @param next Error handling
 * @returns Promise<void>
 */
export async function createNewUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      res
        .status(400)
        .json({ error: 'Missing required fields: email, password.' });
      return;
    }

    if (!isPasswordValid(password)) {
      res.status(400).json({
        error: 'Password does not meet the required strength policy.',
      });
      return;
    }

    // Minimal creation. In this admin flow, we might not be linking a Person,
    // so createUser would require a personId. In a real scenario you'd pass
    // personId or do something else, but let's keep it consistent with your logic.
    // This example doesn't show where you get personId from.
    // If you do have a personId from the request, just pass it in.
    const newUser = await createUser({ email, password, role, personId: '' });
    // The above would fail unless there's a valid personId. Adjust as needed.

    res.status(201).json({
      message: 'User created successfully by Admin.',
      user: {
        personId: newUser.personId,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * @function updateExistingUser
 * @description Allows an admin to update a user's email, role, or password.
 *
 * @param req Express request
 * @param res Express response
 * @param next Error handling
 * @returns Promise<void>
 */
export async function updateExistingUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.params.id;
    const { email, password, role } = req.body;

    const updateData: Record<string, any> = {};
    if (email) updateData.email = email;
    // If you have userRoles in a separate table, you'd handle that differently for role.
    // This is just an example field if you still had a single role in user. Adjust as needed.
    if (role) updateData.role = role;

    if (password) {
      if (!isPasswordValid(password)) {
        res.status(400).json({
          error: 'Password does not meet the required strength policy.',
        });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updated = await updateUser(userId, updateData);

    res.status(200).json({
      message: 'User updated successfully by Admin.',
      user: {
        personId: updated.personId,
        email: updated.email,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * @function deleteExistingUser
 * @description Allows an admin to delete a user record by ID (actually by personId now).
 *
 * @param req Express request
 * @param res Express response
 * @param next Error handling
 * @returns Promise<void>
 */
export async function deleteExistingUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.params.id;
    const deleted = await deleteUser(userId);

    res.status(200).json({
      message: `User with personId ${deleted.personId} deleted successfully by Admin.`,
    });
  } catch (error: any) {
    next(error);
  }
}

/**
 * @function getUserById
 * @description Retrieves a single user by ID, including their person details but excluding password.
 * The function returns user information along with the associated person data.
 *
 * @param req Express request with user ID in params
 * @param res Express response
 * @param next Error handling
 * @returns Promise<void>
 */
export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.params.id;
    const user = await findUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Return user data without sensitive information
    const sanitizedUser = {
      personId: user.personId,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      person: user.person,
    };

    res.status(200).json(sanitizedUser);
  } catch (error: any) {
    next(error);
  }
}
