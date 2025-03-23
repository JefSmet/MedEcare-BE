/**
 * @description
 * The primary Express application setup file.
 *
 * Key features:
 * - Initializes Express
 * - Loads environment variables
 * - Configures global middleware
 * - Defines a basic health-check route
 * - Initializes Passport strategies
 * - Mounts auth-related routes under /auth
 * - Mounts admin-related routes and new model routes under /admin
 */

import express, { Request, Response } from 'express';
import morgan from 'morgan';
import passport from 'passport';

import { loadEnv } from './config/env';
import './config/passport-strategies'; // ensure strategies are loaded
import adminRoutes from './routes/admin-routes';
import authRoutes from './routes/auth-routes';

import activityRoutes from './routes/activity-routes';
import personRoutes from './routes/person-routes';
import roleRoutes from './routes/role-routes';
import shiftTypeRateRoutes from './routes/shift-type-rate-routes';
import shiftTypeRoutes from './routes/shift-type-routes';
import userConstraintRoutes from './routes/user-constraint-routes';

// Step 3 imports for Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

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

// 7. Existing admin routes from admin-routes.ts
app.use('/admin', adminRoutes);

// 8. Additional admin sub-routes for new models
app.use('/admin/persons', personRoutes);
app.use('/admin/roles', roleRoutes);
app.use('/admin/shift-types', shiftTypeRoutes);
app.use('/admin/shift-type-rates', shiftTypeRateRoutes);
app.use('/admin/activities', activityRoutes);
app.use('/admin/user-constraints', userConstraintRoutes);

// 9. Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
