/**
 * @description
 * This file configures swagger-jsdoc to generate the OpenAPI specification for our app.
 *
 * Key points:
 * - Sets the OpenAPI version to 3.0.0
 * - Defines API metadata (title, version, description)
 * - Uses CookieAuth (instead of BearerAuth) for JWT via HttpOnly cookies
 * - Exports the swaggerSpec for swagger-ui-express
 */

import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

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
    // Point to locations of your JSDoc/Swagger comments
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
