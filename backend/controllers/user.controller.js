const tokenfunctions = require("./token.controller");
const userModel = require("../model/user.model");

const bcrypt = require("bcryptjs"); 

const createUser = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    let admin = req.body.admin ?? false;
  
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "datos incompletos" });
    }

    const coincidencia = await userModel.occupied(nombre, email);
    if (coincidencia) {
      return res
        .status(400)
        .json({ message: "Nombre o correo ya ocupados" });
    }
    
    const saltos = await bcrypt.genSalt(10); 
    const hash = await bcrypt.hash(password, saltos); 

    const userId = await userModel.addUser(nombre, email, hash, admin);

    const token = tokenfunctions.generateToken(userId, admin);

    return res
      .status(200)
      .json({ mensaje: "usuario creado correctamente", userId, token, nombre });
  } catch (error) {
    console.error("error al crear usuario", error);
    res.status(500).json({ mensaje: "Error al crear el usuario" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: "Datos incompletos" });
    }

    const user = await userModel.searchMail(email);

    if (!user) {
      return res.status(400).json({ mensaje: "Credenciales incorrectas" });
    }

    const passValida = await bcrypt.compare(password, user.password);

    if (!passValida){
      return res.status(400).json({mensaje: `Constraseña incorrecta.`});
    }

    const token = tokenfunctions.generateToken(user.idUsuario, user.admin);
    const datos = await userModel.searchId(user.idUsuario);

    return res.status(200).json({ mensaje: "Login realizado correctamente", token, datos });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ mensaje: "Error al realizar login", error: error.message || String(error) });
  }
};

const logout = async (req, res) => {
  const token = req.token;
  await tokenfunctions.revoker(token);
  res.status(200).json({ mensaje: "Token revocado correctamente" });
};

module.exports = {
    createUser,
    login,
    logout
}