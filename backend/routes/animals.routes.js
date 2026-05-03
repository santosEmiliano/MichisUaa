const express = require("express");
const router = express.Router();
const token = require("../middleware/verifyToken");
const animalsFunctions = require("../controllers/animals.controller");

// Ruta GET de animales
router.get(
  "/get",
  token.verifyToken,
  animalsFunctions.getAnimals
);

// Ruta POST de animales
router.post(
  "/post",
  token.verifyToken,
  animalsFunctions.createAnimal
);

// Ruta PUT de animales
router.put(
  "/put",
  token.verifyToken,
  animalsFunctions.updateAnimal
);

// Ruta DELETE de animales
router.delete(
  "/delete",
  token.verifyToken,
  animalsFunctions.deleteAnimal
);