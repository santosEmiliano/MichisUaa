const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MichisUAA API",
      version: "1.0.0",
      description:
        "Documentación oficial de los endpoints de la API para el sistema MichisUAA (Usuarios, Gatos, Colonias, Avistamientos y Estadísticas).",
    },
    // Definimos la raíz "/" para que en un hosting o entorno de producción
    // Swagger detecte automáticamente el dominio actual sin quemar una URL específica.
    servers: [
      {
        url: "/",
        description: "Servidor actual (Local o Producción)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Introduce el token JWT aquí (sin la palabra Bearer)",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Le decimos a Swagger en qué archivos va a encontrar nuestros comentarios (JSDoc)
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

// Función para inicializar la ruta en el index.js
const swaggerDocs = (app, port) => {
  // Monta la interfaz de usuario de Swagger en la ruta /api-docs
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "API Docs - MichisUAA",
      customCss: ".swagger-ui .topbar { display: none }",
    })
  );

  console.log(`Documentación Swagger disponible en /api-docs`);
};

module.exports = { swaggerDocs };
