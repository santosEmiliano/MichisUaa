const express = require("express");
const router = express.Router();

// -------------------------------------------- DE PRUEBA --------------------------------------------
// ENDPOINT QUE RETORNA LA INFORMACION DEL USUARIO SEGUN SU ID
router.get("/login", (req, res) => {
  res.send('Si jala');
});
// ---------------------------------------------------------------------------------------------------

module.exports = router;