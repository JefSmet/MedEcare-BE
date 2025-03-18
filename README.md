# MedEcare-BE

This repository contains a Node.js backend server built with:

- **Express.js** for the web server
- **Passport.js** for authentication (Local & JWT)
- **Prisma** as the ORM
- **MS SQL Server** as the database
- **bcrypt** for password hashing
- **SendGrid** for email (password reset links, etc.)
- **Rate limiting** (express-rate-limit) for security
- **Role-based access control** for admin vs. user permissions
- Deployment targeted for **Windows Server with IIS** using **iisnode**.

---

## Table of Contents

- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Installation and Setup](#installation-and-setup)
  - [Environment Variables](#environment-variables-1)
  - [Database Configuration](#database-configuration)
- [Running the App Locally (Development)](#running-the-app-locally-development)
- [Deployment to Windows Server & IIS](#deployment-to-windows-server--iis)
  - [1. Install Node.js and iisnode](#1-install-nodejs-and-iisnode)
  - [2. Configure IIS](#2-configure-iis)
  - [3. Prepare the Production Build (if-needed)](#3-prepare-the-production-build-if-needed)
  - [4. Deploy and Configure web.config](#4-deploy-and-configure-webconfig)
  - [5. Set Up Environment Variables or .env.local](#5-set-up-environment-variables-or-envlocal)
  - [6. Verify Application](#6-verify-application)
- [Testing](#testing)
- [Additional Notes and Troubleshooting](#additional-notes-and-troubleshooting)
- [License](#license)

---

## Key Features

1. **User Registration & Login** using Passport Local Strategy.
2. **JWT Authentication** with different expiration times for web vs. mobile.
3. **Password Reset** via email using SendGrid.
4. **Password Change & Logout** endpoints.
5. **Refresh Tokens** for session persistence.
6. **Role-based access control** to allow Admin users to manage other users.
7. **REST API** for CRUD operations on users (Admin-only) and other potential entities.
8. **Prisma ORM** for clean and robust database access to MS SQL Server.
9. **Rate Limiting** on certain endpoints (e.g., login) to prevent brute-force attacks.

---

## Project Structure

The codebase adheres to the following structure:

```

project-root/ ├─ src/ │ ├─ config/ # Configuration files (passport, env, rate-limit) │ ├─ controllers/ # Express route handlers │ ├─ middleware/ # Authentication and role-based middlewares │ ├─ prisma/ # Prisma schema and migrations │ ├─ routes/ # Route definitions │ ├─ services/ # Business logic & DB integration │ ├─ tests/ # Jest-based tests │ ├─ utils/ # Helper utilities (token generation, password validation, etc.) │ ├─ app.ts # Express app initialization │ └─ server.ts # Server entry point (listens on the configured PORT) ├─ .env.example # Example env file ├─ .env.local # Local environment variables (not tracked by Git) ├─ package.json ├─ tsconfig.json ├─ web.config # Configuration file for IIS + iisnode (optional example) └─ README.md # This file

```

---

## API Endpoints

Below is an overview of the main routes and their purposes.

### Authentication Routes (`/auth/...`)

| Method | Endpoint            | Description                                                                           |
|--------|---------------------|---------------------------------------------------------------------------------------|
| POST   | `/auth/register`    | Registers a new user with `email` and `password`. Validates password strength.       |
| POST   | `/auth/login`       | Authenticates a user using Passport Local Strategy. Returns access & refresh tokens. |
| POST   | `/auth/refresh`     | Exchanges an existing refresh token for new tokens.                                  |
| POST   | `/auth/forgot-password` | Initiates password reset by sending a reset link to user's email.             |
| POST   | `/auth/reset-password`  | Sets a new password using the provided reset token.                             |
| POST   | `/auth/change-password` | Changes the password for a logged-in user if old password is correct.           |
| POST   | `/auth/logout`      | Invalidates the user's refresh token to end the session.                             |

### Admin Routes (`/admin/...`)

| Method | Endpoint                  | Description                                                       |
|--------|---------------------------|-------------------------------------------------------------------|
| GET    | `/admin/users`           | Lists all users (email, role, timestamps).                        |
| POST   | `/admin/users`           | Creates a new user (admin can specify role, e.g., `ADMIN` or `USER`). |
| PUT    | `/admin/users/:id`       | Updates a user (e.g., email, password, role).                     |
| DELETE | `/admin/users/:id`       | Deletes a user by ID.                                             |

> **Note**: All `/admin/...` routes require an **access token** belonging to a user with **role = ADMIN**. Any non-Admin user will receive a **403 Forbidden**.

---

## Installation and Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/YourOrg/medecare-be.git
   cd medecare-be

```

2. **Install Node.js dependencies**:
    
    ```bash
    npm install
    ```
    
3. **Install MS SQL Server** if not already available, or ensure you have access to a running MS SQL instance.
    
4. **Set environment variables** by creating a copy of `.env.example`:
    
    ```bash
    cp .env.example .env.local
    ```
    
    Then fill in the actual values for:
    
    - `DB_URL` (MS SQL connection string)
    - `JWT_SECRET`
    - `SENDGRID_API_KEY`
    - `PORT` (if different from 3000)
    - etc.

---

### Environment Variables

|Variable|Description|Example|
|---|---|---|
|`DB_URL`|MS SQL Server connection string|`server=localhost;database=mydb;user=sa;password=mypassword;`|
|`JWT_SECRET`|Secret key for signing JWTs|`your_jwt_secret_here`|
|`SENDGRID_API_KEY`|SendGrid API key for sending password reset emails|`SG.xxxxxxxx`|
|`PORT`|Port on which the Express app will listen|`3000`|

Store these in `.env.local` for local dev. For production, set them as **System Environment Variables** or another secure method.

---

### Database Configuration

This project uses **Prisma** to manage database schema and migrations. For local development:

1. Update `DB_URL` in `.env.local` to point to your local or remote MS SQL instance.
2. Run migrations (if your database is empty or you want to sync schema):
    
    ```bash
    npx prisma migrate dev
    ```
    
    This will create or update tables according to `schema.prisma`.

---

## Running the App Locally (Development)

1. **Start the application** in development mode:
    
    ```bash
    npm run dev
    ```
    
    By default, the server runs on [http://localhost:3000](http://localhost:3000/).
    
2. **Test the endpoints** (e.g., using Postman or cURL). For example:
    
    ```bash
    curl http://localhost:3000/auth/register
    ```
    
3. **Run the tests** (unit and integration):
    
    ```bash
    npm test
    ```
    

---

## Deployment to Windows Server & IIS

### 1. Install Node.js and iisnode

- Ensure you have **Node.js** installed on your Windows Server.
- Install [**iisnode**](https://github.com/tjanczuk/iisnode).

### 2. Configure IIS

1. Open **IIS Manager** (`inetmgr`).
2. Right-click **Sites** > **Add Website**:
    - Site name: e.g., `MedEcareApp`
    - Physical path: your project folder
    - Binding: e.g., `http` on `*:80` or use SSL if you have a certificate
3. Ensure **iisnode** is installed and recognized by IIS.

### 3. Prepare the Production Build (if needed)

- Compile TypeScript to JavaScript for better performance:
    
    ```bash
    npm run build
    ```
    
- This outputs transpiled files to `dist/`.

### 4. Deploy and Configure `web.config`

- A sample `web.config` can instruct IIS to route `.js` requests via iisnode.
- Adjust settings (like `nodeProcessCommandLine`, `stdoutLogFile`, etc.) as needed.

### 5. Set Up Environment Variables or `.env.local`

- On Windows Server, you may:
    - Set environment variables at the system level, or
    - Place a `.env.local` in the project folder.
- Make sure `JWT_SECRET`, `DB_URL`, etc., are properly set in production.

### 6. Verify Application

- Restart your site in IIS.
- Navigate to the domain or IP to ensure the Node.js application responds.
- Check logs if encountering any errors.

---

## Testing

For local or CI-based testing:

```bash
npm test
```

This uses **Jest** and **supertest** for integration tests. For production, ensure a separate test DB or environment as needed.

---

## Additional Notes and Troubleshooting

1. **iisnode Logging**: Configure `stdoutLogFile` in `web.config` to get logs on your server.
2. **SSL**: Configure certificate bindings in IIS for HTTPS traffic.
3. **Performance**: For high-traffic scenarios, consider PM2 or other load-balancing solutions.

---

## License

This project is provided under the [MIT License](https://opensource.org/licenses/MIT). See the [LICENSE](https://chatgpt.com/c/LICENSE) file for details.

---
