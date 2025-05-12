/**
 * @description
 * Generates the OpenAPI spec and mounts Swagger UI
 * so that HttpOnly cookies (accessToken) are included in every call.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/* ------------------------------------------------------------------ */
/* 1. Spec generation (ongewijzigd)                                   */
/* ------------------------------------------------------------------ */
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
    security: [{ CookieAuth: [] }],
  },
  apis: [
    path.join(__dirname, '../routes/schema-components.ts'),
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

/* ------------------------------------------------------------------ */
/* 2. Helper om Swagger UI te mounten mét cookie-support              */
/* ------------------------------------------------------------------ */
export function setupSwagger(app: express.Express): void {
  // (optioneel) ruwe JSON spec voor debug
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // interactieve UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    // cast naar RequestHandler voorkomt TS-overload-error
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'MedEcare Docs',
      swaggerOptions: {
        // <-- dit voegt credentials: 'include' toe aan elke fetch van de UI
        requestInterceptor: (req: any) => {
          req.credentials = 'include';
          return req;
        },
      },
    }) as express.RequestHandler,
  );
}

/* ------------------------------------------------------------------ */
/* 3. (optioneel) plain export van de spec als je die elders nodig hebt */
/* ------------------------------------------------------------------ */
export default swaggerSpec;
