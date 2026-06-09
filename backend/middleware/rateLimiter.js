const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // Límite de 5 peticiones
  message: { mensaje: "Demasiados intentos de inicio de sesión, por favor inténtalo de nuevo después de 5 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter
};
