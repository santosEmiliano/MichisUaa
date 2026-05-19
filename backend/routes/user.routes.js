const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const userFunctions = require("../controllers/user.controller");

//Ruta POST de Login
router.post(
  "/login",
  userFunctions.login
);

//Ruta GET de usuarios para admin
router.get(
  "/",
  token.verifyToken,
  token.verifyAdmin,
  userFunctions.obtainUsers
);

// Ruta POST de Registro (crear nuevo usuario desde el panel admin)
router.post(
    "/register", 
    userFunctions.createUser
);

//Ruta POST de Logout
router.post(
  "/logout",
  token.verifyToken,
  userFunctions.logout
);

//Ruta GET de medallas de un usuario por ID
router.get(
  "/:id/medallas",
  token.verifyToken,
  userFunctions.getUserMedals
);

//Ruta PUT de updateUser
router.put(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  userFunctions.updateUser
)

//Ruta DELETE para removeUser
router.delete(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  userFunctions.removeUser
)

// -------------------------------------------- DE PRUEBA --------------------------------------------
// ENDPOINT QUE RETORNA LA INFORMACION DEL USUARIO SEGUN SU ID
router.get("/login", (req, res) => {
  res.send('Si jala');
});
// ---------------------------------------------------------------------------------------------------

module.exports = router;