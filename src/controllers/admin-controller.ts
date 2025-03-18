/**
 * @description
 * The Admin Controller handles user management tasks that are restricted to 'ADMIN' role.
 * This includes listing users, creating users with specified roles, updating user details,
 * and deleting users.
 *
 * Key features:
 * - listUsers: Returns a list of all users (with sensitive fields like password excluded).
 * - createNewUser: Creates a user with a specified role and hashed password.
 * - updateExistingUser: Updates user attributes (email, role, password, etc.).
 * - deleteExistingUser: Deletes a user record from the database.
 *
 * @dependencies
 * - express: For Request, Response, NextFunction
 * - user-service: Provides data access methods for the User model
 * - password-validator: For verifying the strength of a new password if one is provided
 * - bcrypt: For hashing a new password if it is updated
 *
 * @notes
 * - Admin operations must be called only after passing jwtAuth and requireAdmin middlewares.
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
 * @description Retrieves a list of all users from the database.
 * Excludes sensitive fields like the password hash.
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {NextFunction} next - Next function for error handling
 *
 * @example
 *  GET /admin/users
 *  Headers: { Authorization: 'Bearer <ADMIN_ACCESS_TOKEN>' }
 */
export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await findAllUsers();

    // Exclude passwords or other sensitive fields
    const sanitized = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    res.status(200).json({ users: sanitized });
    return; // ensures function returns Promise<void>
  } catch (error: any) {
    next(error);
  }
}

/**
 * Interface describing the request body for creating a new user via admin.
 */
interface CreateUserBody {
  email?: string;
  password?: string;
  role?: string;
}

/**
 * @function createNewUser
 * @description Allows an admin to create a new user. The admin can specify the user's role.
 * If no role is provided, the default is 'USER'. Password must pass our strength policy.
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {NextFunction} next - Next function for error handling
 *
 * @example
 *  POST /admin/users
 *  {
 *    "email": "someone@example.com",
 *    "password": "StrongPass#1",
 *    "role": "ADMIN"
 *  }
 */
export async function createNewUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password, role } = req.body as CreateUserBody;

    if (!email || !password) {
      res.status(400).json({
        error: 'Missing required fields: email, password.',
      });
      return;
    }

    if (!isPasswordValid(password)) {
      res.status(400).json({
        error: 'Password does not meet the required strength policy.',
      });
      return;
    }

    // Reuse existing createUser service
    const newUser = await createUser({ email, password, role });

    res.status(201).json({
      message: 'User created successfully by Admin.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
    return;
  } catch (error: any) {
    next(error);
  }
}

/**
 * Interface describing the request body for updating an existing user.
 * Any of these fields are optional; admin can pass whichever they'd like to update.
 */
interface UpdateUserBody {
  email?: string;
  password?: string;
  role?: string;
}

/**
 * @function updateExistingUser
 * @description Allows an admin to update a user's email, role, or password. Only fields
 * provided in the request body will be updated.
 *
 * If `password` is provided, it must pass our strength policy and will be hashed before storage.
 *
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {NextFunction} next - Next function for error handling
 *
 * @example
 *  PUT /admin/users/:id
 *  {
 *    "email": "updated-email@example.com",
 *    "password": "NewStrongPass#1",
 *    "role": "USER"
 *  }
 */
export async function updateExistingUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.params.id;
    const { email, password, role } = req.body as UpdateUserBody;

    // Prepare a data object for updating
    const updateData: Record<string, any> = {};

    if (email) {
      updateData.email = email;
    }

    if (role) {
      updateData.role = role;
    }

    if (password) {
      if (!isPasswordValid(password)) {
        res.status(400).json({
          error: 'Password does not meet the required strength policy.',
        });
        return;
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updated = await updateUser(userId, updateData);

    res.status(200).json({
      message: 'User updated successfully by Admin.',
      user: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
    return;
  } catch (error: any) {
    next(error);
  }
}

/**
 * @function deleteExistingUser
 * @description Allows an admin to delete a user record by ID.
 *
 * @param {Request} req - Express request, must contain :id in the route param
 * @param {Response} res - Express response
 * @param {NextFunction} next - Next function for error handling
 *
 * @example
 *  DELETE /admin/users/:id
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
    return;
  } catch (error: any) {
    next(error);
  }
}
