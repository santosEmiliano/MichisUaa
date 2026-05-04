const coloniesModel = require("../model/colonies.model");

// GET ALL
const readColonies = async (req, res) => {
    const { idEncargado } = req.query
    try {
        const colonies = await coloniesModel.getAllColonies(idEncargado);
        return res.status(200).json(colonies);
    } catch (error) {
        console.error("Error al obtener lista de colonias:", error);
        return res.status(500).json({ mensaje: "Error al obtener las colonias" });
    }
};

// GET BY ID
const readColonyById = async (req, res) => {
  try {
    const { id } = req.params;
    const colony = await coloniesModel.getColonyById(id);
    
    if (!colony) {
      return res.status(404).json({ mensaje: "Colonia no encontrada, verifique la id" });
    }
    
    return res.status(200).json(colony);
  } catch (error) {
    console.error("Error al obtener colonia:", error);
    return res.status(500).json({ mensaje: "Error al obtener la colonia" });
  }
};

// CREATE
const registerColony = async (req, res) => {
  try {
    const { nombre, descripcion, zona, encargadosIds } = req.body;
    
    // Validacion para que no haya ausencia de datos respecto a la colonia
    if (!nombre || !descripcion || !zona || !Array.isArray(encargadosIds) || encargadosIds.length <= 0) {
      return res.status(400).json({ 
        mensaje: "Es necesario nombre, descripcion, zona y minimo un encargado de la colonia" 
      });
    }

    const newColony = await coloniesModel.createColony(req.body);
    
    return res.status(201).json({ 
      mensaje: "Colonia registrada correctamente", 
      colonia: newColony 
    });
  } catch (error) {
    console.error("Error al crear colonia nueva:", error);
    return res.status(500).json({ mensaje: "Error al registrar la nueva colonia" });
  }
};

// UPDATE
const modifyColony = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificamos si existe antes de intentar actualizar
    const existingAnimal = await animalModel.getAnimalById(id);
    if (!existingAnimal) {
      return res.status(404).json({ mensaje: "Animal no encontrado para actualizar" });
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
const removeColony = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificamos si existe antes de intentar eliminar
    const existingAnimal = await animalModel.getAnimalById(id);
    if (!existingAnimal) {
      return res.status(404).json({ mensaje: "Animal no encontrado para eliminar" });
    }

    await animalModel.deleteAnimal(id);
    
    return res.status(200).json({ mensaje: "Animal eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar animal:", error);
    return res.status(500).json({ mensaje: "Error al eliminar el animal" });
  }
};

module.exports = {
  readColonies,
  readColonyById,
  registerColony,
  modifyColony,
  removeColony
};