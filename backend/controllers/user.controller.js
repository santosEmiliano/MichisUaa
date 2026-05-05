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

const obtainUsers = async (req, res) => {
  try {
    const usuarios = await userModel.getUsers();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("error al obtener datos de usuarios: ", error);
    res.status(500).json({ mensaje: "Error al obtener datos de usuarios" });
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const oldUser = await userModel.searchId(id);
    if (!oldUser) {
      return res.status(404).json({ mensaje: "El id no coincide con ningun usuario registrado, porfavor comprobar usuario" });
    }

    const data = { ...req.body };

    if (data.password) {
      const saltos = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(dataToUpdate.password, saltos);
    }

    const updatedUser = await userModel.modifyUser(id, data);

    return res.status(200).json({
      mensaje: "Usuario actualizado correctamente",
      modificado: updatedUser
    });

  } catch (error) {
    console.error("error al modificar los datos de usuario: ", error);
    res.status(500).json({ mensaje: "Error al realizar la modificacion de los datos del usuario" });
  }
}

const removeUser = async (req, res) => {
  try {
    const { id } = req.params;

    const oldUser = await userModel.searchId(id);
    if (!oldUser) {
      return res.status(404).json({ mensaje: "El id no coincide con ningun usuario registrado, porfavor comprobar usuario" });
    }

    await userModel.deleteUser(id);

    return res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
  } catch(error) {
    console.error("error al eliminar los datos del usuario: ", error);
    res.status(500).json({ mensaje: "Error al realizar la eliminacion del usuario"});
  }
}

module.exports = {
    createUser,
    login,
    logout,
    obtainUsers,
    updateUser,
    removeUser
}