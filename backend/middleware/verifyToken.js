const jwt = require("jsonwebtoken");

const redis = require("../utils/redisClient");

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Formato inválido.",
      });
    }

    const estaRevocado = await redis.get(token);
    if (estaRevocado) {
      return res.status(401).json({ success: false, message: "Token revocado" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.id;
    req.isAdmin = decoded.admin; 
    req.token = token;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expirado. Haga login de nuevo." });
    }
    return res.status(401).json({ success: false, message: "Token inválido o manipulado." });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, message: "Acceso denegado: Se requieren permisos de administrador." });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
};