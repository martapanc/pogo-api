const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'PoGo Connect API',
        description: 'Rest API for the PoGo Connect app',
    },
    host: 'localhost:3001',
    schemes: ['http'],
};

const outputFile = './swagger/swagger.json';
const endpointFiles = ['./src/app.ts'];

/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointFiles, doc);
