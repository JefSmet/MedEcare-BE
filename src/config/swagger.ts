/**
 * @description
 * This file configures swagger-jsdoc to generate the OpenAPI specification for our app.
 *
 * Key features:
 * - Sets OpenAPI to 3.0.0
 * - Defines API info (title, version, description)
 * - Declares security schemes (BearerAuth) for JWT usage
 * - Exports the swaggerSpec to be used by swagger-ui-express
 *
 * @dependencies
 * - swagger-jsdoc: For generating the spec from JSDoc comments
 *
 * @notes
 * - Additional configuration like servers, tags, etc., can be added as needed.
 * - We reference the "src/routes" or "src/controllers" directories (depending on JSDoc usage)
 *   so that swagger-jsdoc can pick up the annotations in those files.
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
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    // Adjust these globs or paths to wherever you've annotated your endpoints
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
