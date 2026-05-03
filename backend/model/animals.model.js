const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CREATE
async function createAnimal(data) {
  try {
    const newAnimal = await prisma.animal.create({
      data: {
        Colonia_idColonia: data.Colonia_idColonia,
        nombre: data.nombre,
        esterilizado: data.esterilizado || false,
        foto: data.foto || null,
        estado: data.estado || 'Registrado',
        fecha_nac: data.fecha_nac ? new Date(data.fecha_nac) : null,
        fecha_esterilizacion: data.fecha_esterilizacion ? new Date(data.fecha_esterilizacion) : null,
        descripcion: data.descripcion || null,
      }
    });
    return newAnimal;
  } catch (error) {
    console.error("Error creando animal:", error);
    throw error;
  } 
}

// READ ALL
async function getAllAnimals() {
  try {
    const animals = await prisma.animal.findMany();
    return animals;
  } catch (error) {
    console.error("Error obteniendo animales:", error);
    throw error;
  }
}

// READ ONE
async function getAnimalById(id) {
  try {
    const animal = await prisma.animal.findUnique({
      where: { idAnimal: Number(id) },
    });
    return animal;
  } catch (error) {
    console.error("Error buscando animal por id:", error);
    throw error;
  }
}

// UPDATE
async function updateAnimal(id, data) {
  try {
    // Solo actualizamos los campos que vengan en la petición
    const updateData = {};
    if (data.Colonia_idColonia !== undefined) updateData.Colonia_idColonia = data.Colonia_idColonia;
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.esterilizado !== undefined) updateData.esterilizado = data.esterilizado;
    if (data.foto !== undefined) updateData.foto = data.foto;
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.fecha_nac !== undefined) updateData.fecha_nac = data.fecha_nac ? new Date(data.fecha_nac) : null;
    if (data.fecha_esterilizacion !== undefined) updateData.fecha_esterilizacion = data.fecha_esterilizacion ? new Date(data.fecha_esterilizacion) : null;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;

    const updatedAnimal = await prisma.animal.update({
      where: { idAnimal: Number(id) },
      data: updateData
    });
    return updatedAnimal;
  } catch (error) {
    console.error("Error actualizando animal:", error);
    throw error;
  }
}

// DELETE
async function deleteAnimal(id) {
  try {
    const deletedAnimal = await prisma.animal.delete({
      where: { idAnimal: Number(id) }
    });
    return deletedAnimal;
  } catch (error) {
    console.error("Error eliminando animal:", error);
    throw error;
  }
}

module.exports = {
  createAnimal,
  getAllAnimals,
  getAnimalById,
  updateAnimal,
  deleteAnimal
};