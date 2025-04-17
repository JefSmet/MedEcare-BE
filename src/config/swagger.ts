/**
 * @description
 * Dit bestand configureert swagger-jsdoc om de OpenAPI-specificatie voor onze app te genereren.
 *
 * Hoofdpunten:
 * - Stelt openapi in op 3.0.0
 * - Definieert API-info (title, version, description)
 * - DECLAREERT nu CookieAuth (i.p.v. BearerAuth) voor JWT via HttpOnly cookies
 * - Exporteert de swaggerSpec die door swagger-ui-express wordt gebruikt
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
    // Aanpassen aan de locaties waar je JSDoc/Swagger in de code bijhoudt
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
