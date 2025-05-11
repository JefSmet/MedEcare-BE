/**
 * @description
 * This file configures swagger-jsdoc to generate the OpenAPI specification and
 * sets up Swagger UI for the MedEcare-BE application.
 *
 * Key points:
 * - Sets the OpenAPI version to 3.0.0
 * - Defines API metadata (title, version, description)
 * - Uses CookieAuth (apiKey in cookie) for JWT via HttpOnly cookies
 * - Enables Swagger UI to include cookies in requests via requestInterceptor
 * - Exported function `setupSwagger` mounts the UI at `/api-docs`
 */

import express from 'express';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedEcare-BE API',
      version: '1.0.0',
      description: 'OpenAPI documentation for the MedEcare-BE application',
    },
    components: {
      securitySchemes: {
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
    },
    security: [
      {
        CookieAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Mounts Swagger UI at /api-docs
 * @param app Express application instance
 */
export default function setupSwagger(app: express.Express) {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'MedEcare Docs',
      swaggerOptions: {
        // Include HttpOnly cookies (e.g. accessToken) in UI requests
        requestInterceptor: (req: any) => {
          req.credentials = 'include';
          return req;
        },
      },
    }),
  );
}
