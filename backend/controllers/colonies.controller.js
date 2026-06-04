const coloniesModel = require("../model/colonies.model");

// GET ALL
const readColonies = async (req, res) => {
  const { idEncargado } = req.query;
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
      return res
        .status(404)
        .json({ mensaje: "Colonia no encontrada, verifique la id" });
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
    if (
      !nombre ||
      !descripcion ||
      !zona ||
      !Array.isArray(encargadosIds) ||
      encargadosIds.length <= 0
    ) {
      return res.status(400).json({
        mensaje:
          "Es necesario nombre, descripcion, zona y minimo un encargado de la colonia",
      });
    }

    const newColony = await coloniesModel.createColony(req.body);

    return res.status(201).json({
      mensaje: "Colonia registrada correctamente",
      colonia: newColony,
    });
  } catch (error) {
    console.error("Error al crear colonia nueva:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ mensaje: "Ya existe una colonia con este nombre" });
    }
    return res
      .status(500)
      .json({ mensaje: "Error al registrar la nueva colonia" });
  }
};

// UPDATE
const modifyColony = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificamos si existe antes de intentar actualizar
    const oldColony = await coloniesModel.getColonyById(id);
    if (!oldColony) {
      return res
        .status(404)
        .json({ mensaje: "Colonia no encontrada para actualizar" });
    }

    const updatedColony = await coloniesModel.updateColony(id, req.body);

    return res.status(200).json({
      mensaje: "Colonia actualizada correctamente",
      colonia: updatedColony,
    });
  } catch (error) {
    console.error("Error al actualizar colonia:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ mensaje: "Ya existe una colonia con este nombre" });
    }
    return res.status(500).json({ mensaje: "Error al actualizar la colonia" });
  }
};

// DELETE
const removeColony = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificamos si existe antes de intentar eliminar
    const existColony = await coloniesModel.getColonyById(id);
    if (!existColony) {
      return res
        .status(404)
        .json({
          mensaje: "Colonia no encontrada para eliminar, verificar el id",
        });
    }

    await coloniesModel.deleteColony(id);

    return res.status(200).json({ mensaje: "Colonia eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar colonia:", error);
    return res.status(500).json({ mensaje: "Error al eliminar la colonia" });
  }
};

//Funciones Públicas

// Función para devolver nombre y ubicación de cada colonia sin ser administrador
const readColoniesPublic = async (req, res) => {
  try {
    const colonies = await coloniesModel.getColoniesPublic();
    return res.status(200).json(colonies);
  } catch (error) {
    console.error("Error al obtener lista de colonias:", error);
    return res.status(500).json({ mensaje: "Error al obtener las colonias" });
  }
};

module.exports = {
  readColonies,
  readColonyById,
  registerColony,
  modifyColony,
  removeColony,
  readColoniesPublic,
};
