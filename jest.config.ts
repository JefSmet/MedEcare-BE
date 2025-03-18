/**
 * @description
 * Jest configuration for the MedEcare-BE project.
 *
 * Key features:
 * - Uses ts-jest to transpile TypeScript tests
 * - Runs in Node.js environment
 * - Looks for *.test.ts files in the tests directory
 *
 * @notes
 * - Coverage thresholds can be added here if desired.
 */

import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts']
};

export default config;
