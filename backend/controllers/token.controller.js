const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const { searchId } = require("../../model/user/user.model");

const redis = require("../../utils/redisClient");

//creacion de tokens
function generateToken(userId, isAdmin) {
  const token = jwt.sign(
    {
      id: userId,
      admin: isAdmin
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
}

const tokenData = async (req, res) => {
  try {
    const user = await searchId(req.userId);
    if (!user) {
      return res
        .status(400)
        .json({ mensaje: "usuario no encontrado o no recibido!" });
    }

    return res.status(200).json({
      user: user,
    });
  } catch (error) {
    return res.status(500).json({ mensaje: "error al obtener los datos!" });
  }
};

const revoker = async (token) => {
  if (!token) {
    console.log("revocador: token vacío, no se puede guardar");
    return;
  }

  try {
    await redis.set(token, "revocado", { ex: 3600 });
    console.log("Token revocado guardado en Redis");
  } catch (err) {
    console.error("Error guardando token en Redis:", err);
  }
};

module.exports = {
  generateToken,
  tokenData,
  revoker,
};
