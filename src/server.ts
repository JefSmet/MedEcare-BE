/**
 * @description
 * The main entry point of the Node.js server.
 *
 * Key features:
 * - Imports the configured Express app
 * - Reads port from environment variables
 * - Starts the server listening on the specified port
 *
 * @notes
 * - The app logic is in src/app.ts
 * - For production usage, ensure environment variables are properly set
 */

import app from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} \nView the API docs at http://localhost:${PORT}/api-docs`);
});
