const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fixer API",
      version: "2.0.0",
      description: "Fixer Flutter Backend - Full API Documentation",
    },
    servers: [
      {
        url: "https://test-fixer.onrender.com/api/V2",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token from admin/login or loginByCode",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"], // picks up all 14 route files automatically
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
