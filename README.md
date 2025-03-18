
# Node.js Authentication & REST API Server

## Project Overview

This application is a Node.js backend server that implements authentication using Passport.js and manages data using Prisma with an MS SQL Server database.

### Key Features

- User registration and login with email and password
- Secure password hashing with bcrypt
- Role-based access control (Admin, User)
- Password reset via SendGrid
- JSON Web Token (JWT) for access and refresh tokens
- REST API for user and admin routes
- Deployment on Windows Server with IIS

## Quick Start

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Create and Configure Environment Variables:**
   - Copy `.env.example` to `.env.local` (this file is ignored by version control).
   - Fill out your environment variables such as `DB_URL`, `JWT_SECRET`, `SENDGRID_API_KEY`, etc.

3. **Run the Development Server:**

   ```bash
   npm run dev
   ```

4. **Build and Run in Production:**

   ```bash
   npm run build
   npm start
   ```

## Additional Notes

- Prisma is used as the ORM to interact with MS SQL Server.
- The project is structured to easily accommodate additional routes, services, and controllers.
- Passport.js handles authentication strategies (Local and JWT).
