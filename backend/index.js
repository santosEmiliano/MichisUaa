const express = require('express');
const app = express();
const port = 3000;

// Importaciones de rutas
const userRoutes = require('./routes/user.routes');

// Middleware para procesar JSON
app.use(express.json());

// Definición de una ruta básica
app.get('/', (req, res) => {
  res.send('¡Servidor Express funcionando correctamente!');
});

app.use('/user', userRoutes)

// Ejemplo de una ruta adicional
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