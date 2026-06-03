const sightingFunctions = require("../model/sightings.model");
const fileUtils = require("../utils/fileUpload");
const API_URL = process.env.API_URL || "";
const { verificarMedallas } = require("../services/medallas.service");

// GET ALL
const readSightings = async (req, res) => {
  const { idUsuario } = req.query;
  try {
    const sightings = await sightingFunctions.getAllSightings(idUsuario);
    return res.status(200).json(sightings);
  } catch (error) {
    console.error("Error al obtener lista de avistamientos:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al obtener los avistamientos" });
  }
};

// GET BY ID
const readSightingsById = async (req, res) => {
  try {
    const { id } = req.params;
    const sighting = await sightingFunctions.getSightingById(id);

    if (!sighting) {
      return res
        .status(404)
        .json({ mensaje: "Avistamiento no encontrado, verifique la id" });
    }

    return res.status(200).json(sighting);
  } catch (error) {
    console.error("Error al obtener avistamiento:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al obtener el avistamiento" });
  }
};

const registerSighting = async (req, res) => {
  try {
    const { usuarioId, longitud, latitud } = req.body;

    // Validacion para que no haya ausencia de datos
    if (!usuarioId || !longitud || !latitud) {
      return res.status(400).json({
        mensaje: "Es necesario usuario, longitud y latitud",
      });
    }

    if (req.file) {
      req.body.foto_url = `${API_URL}/api/images/sightings/${req.file.filename}`;
    }

    const newSighting = await sightingFunctions.createSighting(req.body);

    // Verificar medallas en segundo plano — no bloquea la respuesta al cliente
    verificarMedallas(usuarioId)
      .then(nuevas => {
        if (nuevas.length > 0) {
          console.log(`Usuario ${usuarioId} ganó nuevas medallas: ${nuevas.map(m => m.tipo).join(', ')}`);
        }
      })
      .catch(err => console.error("Error en la verificación de medallas en segundo plano:", err));

    return res.status(201).json({
      mensaje: "Avistamiento registrado correctamente",
      avistamiento: newSighting,
    });
  } catch (error) {
    console.error("Error al generar nuevo avistamiento:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al registrar el nuevo avistamiento" });
  }
};

const modifySighting = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificamos si existe antes de intentar actualizar
    const oldSighting = await sightingFunctions.getSightingById(id);
    if (!oldSighting) {
      return res
        .status(404)
        .json({ mensaje: "Avistamiento no registrado para actualizar" });
    }

    if (req.file) {
      if (oldSighting.foto_url) {
        await fileUtils.deleteLocalFile(oldSighting.foto_url);
      }

      req.body.foto_url = `${API_URL}/api/images/sightings/${req.file.filename}`;
    }

    const updatedSighting = await sightingFunctions.modifySighting(
      id,
      req.body,
    );

    // Revisar medallas tras verificar o rechazar un avistamiento por un admin
    if (oldSighting.usuarioId) {
      verificarMedallas(oldSighting.usuarioId)
        .then(nuevas => {
          if (nuevas.length > 0) {
            console.log(`Usuario ${oldSighting.usuarioId} ganó nuevas medallas tras actualización: ${nuevas.map(m => m.tipo).join(', ')}`);
          }
        })
        .catch(err => console.error("Error en la verificación de medallas tras actualizar:", err));
    }

    return res.status(200).json({
      mensaje: "Avistamiento actualizado correctamente",
      avistamiento: updatedSighting,
    });
  } catch (error) {
    console.error("Error al actualizar avistamiento:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al actualizar el avistamiento" });
  }
};

// DELETE
const deleteSighting = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificamos si existe antes de intentar eliminar
    const existSighting = await sightingFunctions.getSightingById(id);
    if (!existSighting) {
      return res
        .status(404)
        .json({
          mensaje: "Avistamiento no encontrado para eliminar, verificar el id",
        });
    }

    if (existSighting.foto_url) {
      await fileUtils.deleteLocalFile(existSighting.foto_url);
    }

    await sightingFunctions.removeSighting(id);

    return res
      .status(200)
      .json({ mensaje: "Avistamiento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar avistamiento:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al eliminar el avistamiento" });
  }
};

// RANKING - Posición de un usuario en el ranking
const getUserRank = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sightingFunctions.getUserRankPosition(id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener posición del usuario:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al obtener la posición del usuario" });
  }
};

// RANKING - Top 20 usuarios con más avistamientos verificados
const getTopRanking = async (req, res) => {
  try {
    const ranking = await sightingFunctions.getTop20Ranking();
    return res.status(200).json(ranking);
  } catch (error) {
    console.error("Error al obtener ranking:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al obtener el ranking" });
  }
};

module.exports = {
  readSightings,
  readSightingsById,
  registerSighting,
  modifySighting,
  deleteSighting,
  getUserRank,
  getTopRanking,
};
