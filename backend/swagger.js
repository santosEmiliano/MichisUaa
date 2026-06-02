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

// Middleware de autenticación básica para proteger Swagger
const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.set("WWW-Authenticate", 'Basic realm="Acceso a Documentacion"');
    return res.status(401).send("Se requiere autenticación para ver la documentación.");
  }

  const b64auth = (auth.split(" ")[1] || "");
  const [login, password] = Buffer.from(b64auth, "base64").toString().split(":");

  // Usuario y contraseña para acceder a Swagger
  if (login === "4dminMichisU44" && password === "M1ch1s_U44$2026!") {
    return next();
  }

  res.set("WWW-Authenticate", 'Basic realm="Acceso a Documentacion"');
  return res.status(401).send("Credenciales incorrectas.");
};

// Función para inicializar la ruta gráfica en el index.js
const swaggerDocs = (app, port) => {
  app.use(
    "/api/api-docs",
    basicAuth,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "API Docs - MichisUAA",
      customCss: ".swagger-ui .topbar { display: none }",
    })
  );

  console.log(`Documentación Swagger disponible en /api/api-docs`);
};

module.exports = { swaggerDocs };
