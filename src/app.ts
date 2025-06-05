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
 * - Mounts admin-related routes and resources under /admin
 */

import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { loadEnv } from "./config/env";
import "./config/passport-strategies"; // ensure strategies are loaded
import adminRoutes from "./routes/admin-routes";
import authRoutes from "./routes/auth-routes";

import activityRoutes from "./routes/activity-routes";
import personRoutes from "./routes/person-routes";
import roleRoutes from "./routes/role-routes";
import rosterRoutes from "./routes/roster-routes";
import shiftTypeRateRoutes from "./routes/shift-type-rate-routes";
import shiftTypeRoutes from "./routes/shift-type-routes";
import userConstraintRoutes from "./routes/user-constraint-routes";

// Swagger UI imports
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import { setupSwagger } from "./config/swagger";


// 1. Load environment variables
loadEnv();

// 2. Create the Express app
const app = express();
app.set('etag', false); // Disable ETag generation
// Disable the X-Powered-By header for security
app.disable('x-powered-by');

// 3. Global middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN, // Use value from .env file
    credentials: true, // Allow credentials
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser()); // Parse HttpOnly cookies correctly

// 4. Initialize passport
app.use(passport.initialize());

// 5. Basic route for health check
app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .send("Hello from the Node.js Authentication & REST API Server!");
});

// File upload route (for security testing)
app.post("/upload", (req: Request, res: Response) => {
  res.status(415).json({ error: "File uploads not supported" });
});

// Prevent privilege escalation via user profile updates
app.put("/users/profile", (req: Request, res: Response) => {
  res.status(403).json({ error: "Profile updates not allowed via this endpoint" });
});

// Block TRACE method specifically
app.trace("*", (req: Request, res: Response) => {
  res.status(405).json({ error: "Method not allowed" });
});

// 6. Mount the authentication routes on /auth
app.use("/auth", authRoutes);

// 7. Existing admin routes from admin-routes.ts
app.use("/admin", adminRoutes);

// 8. Additional admin sub-routes for new models
app.use("/admin/persons", personRoutes);
app.use("/admin/roles", roleRoutes);
app.use("/admin/rosters", rosterRoutes);
app.use("/admin/shift-types", shiftTypeRoutes);
app.use("/admin/shift-type-rates", shiftTypeRateRoutes);
app.use("/admin/activities", activityRoutes);
app.use("/admin/user-constraints", userConstraintRoutes);

// 9. Swagger UI route (with customSiteTitle)
// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerSpec, {
//     customSiteTitle: "MedEcare Docs", // <-- This changes the browser tab title
//   })
// );
setupSwagger(app);

export default app;
