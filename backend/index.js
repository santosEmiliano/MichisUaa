require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); 
const rateLimit = require('express-rate-limit');
const app = express();
const port = process.env.PORT || 3000;

// IMPORT DE RUTAS
const userRoutes = require('./routes/user.routes');
const animalRoutes = require('./routes/animals.routes');
const coloniesRoutes = require('./routes/colonies.routes');
const sightingRoutes = require('./routes/sightings.routes');
const stadisticsRoutes = require('./routes/stadistics.routes');
const notificationsRoutes = require('./routes/notifications.routes');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 peticiones
});

// Middlewares globales
app.use(cors()); //De momento asi sin na
app.use(express.json());
app.set('trust proxy', 1);

// Limitador de tasa
app.use('/api/', limiter);

// Archivos estáticos - imágenes subidas localmente
app.use("/api/images", express.static(path.join(__dirname, "images"))); 

// RUTA DE CHECK
app.get('/api', (req, res) => {
  res.send('¡Servidor Express funcionando correctamente en /api!');
});
app.get('/', (req, res) => {
  res.send('¡Servidor Express funcionando en la raíz!');
});

// USE DE RUTAS DE API
app.use('/api/user', userRoutes);
app.use('/api/animal', animalRoutes);
app.use('/api/colonies', coloniesRoutes);
app.use('/api/avistamientos', sightingRoutes);
app.use('/api/stadistics', stadisticsRoutes);
app.use('/api/notifications', notificationsRoutes);

// RUTA DE CHECK 2
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    date: new Date()
  });
});

// Middleware Global de Errores (Ej: Multer file size limit)
app.use((err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ mensaje: "La imagen es demasiado grande. El límite es 5MB." });
    }
    // Otros errores de multer o filtros
    return res.status(400).json({ mensaje: err.message || "Ocurrió un error al procesar la petición." });
  }
  next();
});

// Importar configuración de Swagger
const { swaggerDocs } = require('./swagger');

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
  swaggerDocs(app, port);
});