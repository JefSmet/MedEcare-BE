# MedEcare-BE

This repository contains a Node.js backend server built with:

- **Express.js** for web server
- **Passport.js** for authentication (Local & JWT)
- **Prisma** as ORM
- **MS SQL Server** as the database
- **bcrypt** for password hashing
- **SendGrid** for email (password reset links, etc.)
- **Rate limiting** (express-rate-limit) for security
- **Role-based access control** for admin vs. user permissions
- Deployment targeted for **Windows Server with IIS** using **iisnode**.

## Table of Contents

- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
  - [Environment Variables](#environment-variables)
  - [Database Configuration](#database-configuration)
- [Running the App Locally (Development)](#running-the-app-locally-development)
- [Deployment to Windows Server & IIS](#deployment-to-windows-server--iis)
  - [1. Install Node.js and iisnode](#1-install-nodejs-and-iisnode)
  - [2. Configure IIS](#2-configure-iis)
  - [3. Prepare the Production Build (if needed)](#3-prepare-the-production-build-if-needed)
  - [4. Deploy and Configure Web.config](#4-deploy-and-configure-webconfig)
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

project-root/ ├─ src/ │ ├─ config/ # Configuration files (passport, env, rate-limit) │ ├─ controllers/ # Express route handlers │ ├─ middleware/ # Authentication and role-based middlewares │ ├─ prisma/ # Prisma schema and migrations │ ├─ routes/ # Route definitions │ ├─ services/ # Business logic & DB integration │ ├─ tests/ # Jest-based tests │ ├─ utils/ # Helper utilities (token generation, password validation, etc.) │ ├─ app.ts # Express app initialization │ └─ server.ts # Server entry point (listens on the configured PORT) ├─ .env.example # Example env file ├─ .env.local # Local environment variables (not tracked in Git) ├─ package.json ├─ tsconfig.json ├─ web.config # Configuration file for IIS + iisnode └─ README.md # This file

```

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
    
3. **Install MS SQL Server** if you haven't already, or ensure you have access to a running MS SQL instance.
    
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
|...|Additional environment variables can be documented here|...|

You can store these in `.env.local` for local dev. For production, you may set these as **System Environment Variables** on Windows Server or use a secure config manager.

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
    
    By default, the server will run on [http://localhost:3000](http://localhost:3000/).
    
2. **Test the endpoints** (e.g., using Postman or cURL). For instance:
    
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
- Install [**iisnode**](https://github.com/tjanczuk/iisnode) so that IIS can handle Node.js applications.  
    Typically, you can download and run the iisnode MSI package for your version of Windows.

### 2. Configure IIS

1. Open **IIS Manager** (`inetmgr`).
2. Right-click **Sites** > **Add Website**:
    - Set a **Site name** (e.g., `MedEcareApp`).
    - Set the **Physical path** to your project’s folder (where `web.config` and `package.json` reside).
    - Set the **Binding** (e.g., `http` on `*:80`, or use SSL if you have a certificate).
3. In **Site Features**, ensure that you have installed the **iisnode** module. If not, re-install iisnode.

### 3. Prepare the Production Build (if needed)

- This project is written in TypeScript. In production, you can run:
    
    ```bash
    npm run build
    ```
    
    This command will output the compiled JavaScript files to the `dist` folder.
- If you prefer to run TypeScript directly in production (not recommended), then you can skip this step and rely on **ts-node**. However, for best performance, using a compiled `dist/` output is recommended.

### 4. Deploy and Configure **web.config**

- A sample `web.config` is included at the root of this project. This file instructs IIS to use iisnode to host the app.
- The key line is the `<handlers>` section with `iisnode` as the handler for `.js` requests, and the `nodeProcessCommandLine` specifying `node.exe`.
- Adjust the paths if your build output or main file differs.

### 5. Set Up Environment Variables or .env.local

- On Windows Server, you have options:
    1. Set system environment variables via **System Properties** > **Environment Variables**.
    2. Place a `.env.local` in the same folder as your app with the required values.  
        Make sure `web.config` allows your Node.js process to read that file (or ensure you do not commit it to source control).
- In production, ensure your `DB_URL` and `JWT_SECRET` are set to secure, production-appropriate values.

### 6. Verify Application

- Once everything is in place, **restart** your new site in IIS.
- Navigate to the domain or IP address you bound in Step 2. You should see the Node.js application responding (you can confirm by hitting the `/` endpoint, which returns the welcome message).
- Monitor the **IIS logs** or the Node logs (if enabled) for any startup errors.

---

## Testing

For local or CI-based testing, you can run:

```bash
npm test
```

This uses **Jest** and **supertest** to run integration tests. If you want to run tests in a Windows environment, ensure your environment variables and local dependencies are all set up.

---

## Additional Notes and Troubleshooting

1. **iisnode Logging**: If you need more verbose logging, you can configure `stdoutLogFile` in `web.config` to store logs somewhere on the server (e.g., `C:\inetpub\logs\iisnode\myapp\output.log`).
2. **Accessing environment variables**: In production, confirm that your environment variables are actually read by the Node.js process. You can do so by logging them out for debugging or using a small route to inspect `process.env`.
3. **SSL**: If you want to serve this app over HTTPS, configure a certificate binding in IIS. iisnode can still handle the Node process behind the scenes.
4. **Performance considerations**: If you expect heavy traffic, consider using **PM2** or similar process managers outside of IIS. Alternatively, you can load balance with multiple IIS worker processes or other approaches.

---

## License

This project is provided under the [MIT License](https://opensource.org/licenses/MIT). Please see the [LICENSE](https://chatgpt.com/c/LICENSE) file for more details.
