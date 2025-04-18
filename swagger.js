// swagger.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Opciones de configuración
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API FERREMAS',
      version: '1.0.0',
      description: 'API para el sistema de gestión comercial FERREMAS',
      contact: {
        name: 'Equipo de Desarrollo FERREMAS'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Servidor de desarrollo'
        }
      ]
    }
  },
  // Rutas para los archivos con anotaciones JSDoc
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerDocs
};