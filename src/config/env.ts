/**
 * @description
 * A simple helper file to load environment variables from .env.local
 *
 * Key features:
 * - Uses 'dotenv' to parse .env.local file
 * - Could be extended with schema validation (e.g. Zod or Joi) if desired
 *
 * @notes
 * - Must be called before using any process.env variables
 * - This is invoked at the top of src/app.ts
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    // If .env.local not found, fallback to .env or default
    dotenv.config();
  }
}
