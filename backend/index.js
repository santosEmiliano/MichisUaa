require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const app = express();
const port = 3000;

// IMPORT DE RUTAS
const userRoutes = require('./routes/user.routes');
const animalRoutes = require('./routes/animals.routes');
const coloniesRoutes = require('./routes/colonies.routes');
const sightingRoutes = require('./routes/sightings.routes');

// Middlewares globales
app.use(cors()); //De momento asi sin na
app.use(express.json()); 

// RUTA DE CHECK
app.get('/', (req, res) => {
  res.send('¡Servidor Express funcionando correctamente!');
});

// USE DE RUTAS DE API
app.use('/user', userRoutes);
app.use('/animal', animalRoutes);
app.use('/colonies', coloniesRoutes);
app.use('/avistamientos', sightingRoutes);

// RUTA DE CHECK 2
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    date: new Date()
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});