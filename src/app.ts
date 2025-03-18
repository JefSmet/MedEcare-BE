/**
 * @description
 * The primary Express application setup file.
 * 
 * Key features:
 * - Initializes Express
 * - Loads environment variables (via config/env.ts)
 * - Configures global middleware (JSON, urlencoded, etc.)
 * - Defines a basic health-check route
 * 
 * @notes
 * - This file does not start the server; it only configures and exports the app
 * - Additional middlewares and route registrations will be added later
 */

import express, { Request, Response } from 'express';
import { loadEnv } from './config/env';
import morgan from 'morgan';

// Load environment variables
loadEnv();

// Create the Express app
const app = express();

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Basic route for health check
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Hello from the Node.js Authentication & REST API Server!');
});

export default app;
