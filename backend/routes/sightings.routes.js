const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const multer = require("../middleware/multer");
const sightingFunctions = require("../controllers/sightings.controller");

const upload = multer("sightings");

//Ruta GET para obtener todos los avistamientos
// NOTA: Aqui viene en queryparams el ?idUsuario={id}
router.get("/", token.verifyToken, sightingFunctions.readSightings);

// Ruta pública top 20 usuarios con más avistamientos verificados
router.get("/ranking", token.verifyToken, sightingFunctions.getTopRanking);

// Ruta pública posición de un usuario en el ranking de avistamientos verificados
router.get("/ranking/:id", token.verifyToken, sightingFunctions.getUserRank);

//Ruta GET para obtener avistamiento en especifico
router.get("/:id", token.verifyToken, sightingFunctions.readSightingsById);

//Ruta POST para crear avistamiento
router.post(
  "/",
  token.verifyToken,
  upload.single("foto"),
  sightingFunctions.registerSighting,
);

//Ruta PUT para modificar avistamiento
router.put(
  "/:id",
  token.verifyToken,
  upload.single("foto"),
  sightingFunctions.modifySighting,
);

//Ruta DELETE para eliminar avistamiento
router.delete("/:id", token.verifyToken, sightingFunctions.deleteSighting);

module.exports = router;
