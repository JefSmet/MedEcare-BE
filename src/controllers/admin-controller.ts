/**
 * @description
 * The Admin Controller handles user management tasks restricted to 'ADMIN' role.
 * This includes listing users, creating users, updating user details, and deleting users.
 *
 * Key features:
 * - listUsers
 * - createNewUser
 * - updateExistingUser
 * - deleteExistingUser
 *
 * @dependencies
 * - express: For Request, Response, NextFunction
 * - user-service: Provides data access methods for the User model
 * - password-validator: For verifying the strength of a new password
 * - bcrypt: For hashing a new password if it is updated
 *
 * @notes
 * - All routes must be called after passing jwtAuth and requireAdmin middlewares.
 * - We ensure that no sensitive data (like hashed password) is returned in the response.
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { isPasswordValid } from '../utils/password-validator';
import {
  findAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../services/user-service';

/**
 * @function listUsers
 * @description Retrieves a list of all users, excluding passwords.
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
    const users = await findAllUsers();
    // Example: We no longer store a single user.role in the DB, 
    // but if you have userRoles, you'd flatten them. 
    // For demonstration, we just omit password from the response.
    const sanitized = users.map((u) => ({
      id: u.id,
      email: u.email,
      // role: u.role, // if you had a single role field
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    res.status(200).json({ users: sanitized });
    // no `return res.status(200).json(...);`
    // just res.status(200).json(...);
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
      res.status(400).json({ error: 'Missing required fields: email, password.' });
      return;
    }

    if (!isPasswordValid(password)) {
      res.status(400).json({
        error: 'Password does not meet the required strength policy.',
      });
      return;
    }

    // Uses createUser from user-service
    const newUser = await createUser({ email, password, role});

    res.status(201).json({
      message: 'User created successfully by Admin.',
      user: {
        id: newUser.id,
        email: newUser.email,
        // role: newUser.role, 
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
    if (role) updateData.role = role; // If you still store role in user table
    // If you have userRoles in a separate table, you'd handle that differently.

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
        id: updated.id,
        email: updated.email,
        // role: updated.role, 
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
 * @description Allows an admin to delete a user record by ID.
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
      message: `User with ID ${deleted.id} deleted successfully by Admin.`,
    });
  } catch (error: any) {
    next(error);
  }
}
