/**
 * @description
 * The primary Express application setup file.
 *
 * Key features:
 * - Initializes Express
 * - Loads environment variables (via config/env.ts)
 * - Configures global middleware (JSON, urlencoded, morgan)
 * - Defines a basic health-check route
 * - Initializes Passport strategies
 * - Mounts auth-related routes under /auth
 *
 * @notes
 * - This file does not start the server; it only configures and exports the app
 * - Additional middlewares and route registrations will be added in subsequent steps
 */

import express, { Request, Response } from 'express';
import morgan from 'morgan';
import passport from 'passport';

import { loadEnv } from './config/env';

// Import passport strategies so they're configured on import
import './config/passport-strategies';

// Import the new auth routes
import authRoutes from './routes/auth-routes';

// 1. Load environment variables
loadEnv();

// 2. Create the Express app
const app = express();

// 3. Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 4. Initialize passport
app.use(passport.initialize());

// 5. Basic route for health check
app.get('/', (req: Request, res: Response) => {
  res
    .status(200)
    .send('Hello from the Node.js Authentication & REST API Server!');
});

// 6. Mount the authentication routes on /auth
app.use('/auth', authRoutes);

export default app;
