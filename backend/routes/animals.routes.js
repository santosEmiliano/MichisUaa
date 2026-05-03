const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const animalsFunctions = require("../controllers/animals.controller");

// Obtener todos los animales
router.get(
  "/",
  token.verifyToken,
  animalsFunctions.getAnimals
);

// Obtener un animal por su ID
router.get(
  "/:id",
  token.verifyToken,
  animalsFunctions.getAnimalById
);

// Crear un nuevo animal
router.post(
  "/",
  token.verifyToken,
  animalsFunctions.createAnimal
);

// Actualizar un animal por su ID
router.put(
  "/:id",
  token.verifyToken,
  animalsFunctions.updateAnimal
);

// Eliminar un animal por su ID
router.delete(
  "/:id",
  token.verifyToken,
  animalsFunctions.deleteAnimal
);

module.exports = router;