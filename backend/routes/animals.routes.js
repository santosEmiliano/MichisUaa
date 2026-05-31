const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const animalsFunctions = require("../controllers/animals.controller");
const multer = require("../middleware/multer");

const upload = multer("animals");

// rutas públicas (DEBEN ir antes de /:id para que Express no las confunda)
router.get(
  "/public",
  token.verifyToken,
  animalsFunctions.getAnimalsPublic
)

// Obtener todos los animales
router.get(
  "/",
  token.verifyToken,
  token.verifyAdmin,
  animalsFunctions.getAnimals
);

// Obtener un animal por su ID
router.get(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  animalsFunctions.getAnimalById
);

// Crear un nuevo animal
router.post(
  "/",
  token.verifyToken,
  token.verifyAdmin,
  upload.single('foto'),
  animalsFunctions.createAnimal
);

// Actualizar un animal por su ID
router.put(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  upload.single('foto'),
  animalsFunctions.updateAnimal
);

// Eliminar un animal por su ID
router.delete(
  "/:id",
  token.verifyToken,
  token.verifyAdmin,
  animalsFunctions.deleteAnimal
);

module.exports = router;