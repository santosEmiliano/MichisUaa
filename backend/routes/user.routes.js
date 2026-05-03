const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const userFunctions = require("../controllers/user.controller");

//Ruta POST de Login
router.post(
  "/login",
  userFunctions.login
);

//Ruta POST de Logout
router.post(
  "/logout",
  token.verifyToken,
  userFunctions.logout
);

// -------------------------------------------- DE PRUEBA --------------------------------------------
// ENDPOINT QUE RETORNA LA INFORMACION DEL USUARIO SEGUN SU ID
router.get("/login", (req, res) => {
  res.send('Si jala');
});
// ---------------------------------------------------------------------------------------------------

module.exports = router;