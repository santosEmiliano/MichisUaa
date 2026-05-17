const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const coloniesFunctions = require("../controllers/colonies.controller");

// rutas públicas (DEBEN ir antes de /:id para que Express no las confunda)
router.get(
  "/public",
  token.verifyToken,
  coloniesFunctions.readColoniesPublic
)

// Obtener todos las colonias
// NOTA: Aqui viene en queryparams el ?idEncargado={id}
router.get(
  "/",
  token.verifyToken,
  token.verifyAdmin,
  coloniesFunctions.readColonies
);

// Obtener una colonia por su ID
router.get(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  coloniesFunctions.readColonyById
);

// Crear una nueva colonia
router.post(
  "/",
  token.verifyToken,
  token.verifyAdmin,
  coloniesFunctions.registerColony
);

// Actualizar una colonia
router.put(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  coloniesFunctions.modifyColony
);

// Eliminar una colonia mediante su ID
router.delete(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  coloniesFunctions.removeColony
);

module.exports = router;