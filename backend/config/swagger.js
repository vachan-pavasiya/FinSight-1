const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'FinSight API', version: '1.0.0' },
  paths: {
    '/health': { get: { summary: 'Health check', responses: { 200: { description: 'OK' } } } }
  }
};

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
module.exports = { setupSwagger };
