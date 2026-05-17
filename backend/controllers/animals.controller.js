const animalModel = require("../model/animals.model");
const cloudFunctions = require("../utils/cloudinary");

// GET ALL
const getAnimals = async (req, res) => {
  try {
    const animals = await animalModel.getAllAnimals();
    return res.status(200).json(animals);
  } catch (error) {
    console.error("Error al obtener animales:", error);
    return res.status(500).json({ mensaje: "Error al obtener los animales" });
  }
};

// GET BY ID
const getAnimalById = async (req, res) => {
  try {
    const { id } = req.params;
    const animal = await animalModel.getAnimalById(id);
    
    if (!animal) {
      return res.status(404).json({ mensaje: "Animal no encontrado" });
    }
    
    return res.status(200).json(animal);
  } catch (error) {
    console.error("Error al obtener animal:", error);
    return res.status(500).json({ mensaje: "Error al obtener el animal" });
  }
};

// CREATE
const createAnimal = async (req, res) => {
  try {
    const { Colonia_idColonia, nombre } = req.body;
    
    // Validación mínima requerida por la base de datos
    if (!Colonia_idColonia || !nombre) {
      return res.status(400).json({ 
        mensaje: "Los campos Colonia_idColonia y nombre son obligatorios" 
      });
    }

    if (req.body.fecha_nac) {
      const birthDate = new Date(req.body.fecha_nac);
      const today = new Date();
      if (birthDate > today) {
        return res.status(400).json({ mensaje: "La fecha de nacimiento no puede ser en el futuro" });
      }
    }

    req.body.Colonia_idColonia = Number(req.body.Colonia_idColonia);
    if (req.body.esterilizado !== undefined) {
        req.body.esterilizado = req.body.esterilizado === 'true' || req.body.esterilizado === true; 
        if (req.body.esterilizado && !req.body.fecha_esterilizacion) {
            req.body.fecha_esterilizacion = new Date();
        }
    }
    
    if (req.body.estado === 'Desaparecido') {
        req.body.fecha_desaparicion = new Date();
    }

    if(req.file) {
      const imageData = await cloudFunctions.uploadToCloudinary(req.file.buffer);
      req.body.foto_url = imageData.secure_url;
      req.body.foto_id = imageData.public_id;
    }

    const newAnimal = await animalModel.createAnimal(req.body);
    
    return res.status(201).json({ 
      mensaje: "Animal registrado correctamente", 
      animal: newAnimal 
    });
  } catch (error) {
    console.error("Error al crear animal:", error);
    return res.status(500).json({ mensaje: "Error al registrar el animal" });
  }
};

// UPDATE
const updateAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificamos si existe antes de intentar actualizar
    const existingAnimal = await animalModel.getAnimalById(id);
    if (!existingAnimal) {
      return res.status(404).json({ mensaje: "Animal no encontrado para actualizar" });
    }

    if (req.body.fecha_nac) {
      const birthDate = new Date(req.body.fecha_nac);
      const today = new Date();
      if (birthDate > today) {
        return res.status(400).json({ mensaje: "La fecha de nacimiento no puede ser en el futuro" });
      }
    }

    if (req.body.Colonia_idColonia !== undefined)
      req.body.Colonia_idColonia = Number(req.body.Colonia_idColonia);
    if (req.body.esterilizado !== undefined) {
        const isEsterilizado = req.body.esterilizado === 'true' || req.body.esterilizado === true;
        req.body.esterilizado = isEsterilizado;
        
        if (isEsterilizado && !existingAnimal.esterilizado && !req.body.fecha_esterilizacion) {
            req.body.fecha_esterilizacion = new Date();
        }
    }
    
    if (req.body.estado !== undefined) {
        if (req.body.estado === 'Desaparecido' && existingAnimal.estado !== 'Desaparecido') {
            req.body.fecha_desaparicion = new Date();
        } else if (req.body.estado !== 'Desaparecido' && existingAnimal.estado === 'Desaparecido') {
            req.body.fecha_desaparicion = null;
        }
    }

    if(req.file) {
      if (existingAnimal.foto_id) {
        await cloudFunctions.deleteImage(existingAnimal.foto_id);
      }

      const imageData = await cloudFunctions.uploadToCloudinary(req.file.buffer);
      req.body.foto_url = imageData.secure_url;
      req.body.foto_id = imageData.public_id;
    }

    const updatedAnimal = await animalModel.updateAnimal(id, req.body);
    
    return res.status(200).json({ 
      mensaje: "Animal actualizado correctamente", 
      animal: updatedAnimal 
    });
  } catch (error) {
    console.error("Error al actualizar animal:", error);
    return res.status(500).json({ mensaje: "Error al actualizar el animal" });
  }
};

// DELETE
const deleteAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificamos si existe antes de intentar eliminar
    const existingAnimal = await animalModel.getAnimalById(id);
    if (!existingAnimal) {
      return res.status(404).json({ mensaje: "Animal no encontrado para eliminar" });
    }

    if (existingAnimal.foto_id) {
      await cloudFunctions.deleteImage(existingAnimal.foto_id);
    }
    await animalModel.deleteAnimal(id);
    
    return res.status(200).json({ mensaje: "Animal eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar animal:", error);
    return res.status(500).json({ mensaje: "Error al eliminar el animal" });
  }
};

//Funciones Públicas
const getAnimalsPublic = async (req, res) => {
  try {
    const animals = await animalModel.getAnimalsPublic();
    return res.status(200).json(animals);
  } catch (error) {
    console.error("Error al obtener animales:", error);
    return res.status(500).json({ mensaje: "Error al obtener los animales" });
  }
}

module.exports = {
  getAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  getAnimalsPublic
};