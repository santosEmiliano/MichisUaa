const prisma = require('../db/prisma');

// model Avistamiento {
//   idAvistamiento Int      @id @default(autoincrement())
//   usuarioId      Int
//   animalId       Int?
//   verificadoPor  Int?
//   foto           String?  @db.VarChar(150)
//   descripcion    String?  @db.VarChar(400)
//   verificado     Boolean  @default(false)
//   longitud       Decimal  @db.Decimal(9, 1)
//   latitud        Decimal  @db.Decimal(9, 1)
//   createdAt      DateTime @default(now()) @map("created_at")

//   usuario     Usuario  @relation("RegistradoPor", fields: [usuarioId], references: [idUsuario], onDelete: Cascade)
//   animal      Animal?  @relation(fields: [animalId], references: [idAnimal])
//   verificador Usuario? @relation("VerificadoPor", fields: [verificadoPor], references: [idUsuario], onDelete: SetNull)

//   @@map("Avistamiento")
// }

// CREATE
async function createSighting(data) {
  try {
    const newSighting = await prisma.avistamiento.create({
      data: {
        
        usuarioId: Number(data.usuarioId), 
        longitud: data.longitud, 
        latitud: data.latitud,

        animalId: data.animalId ? Number(data.animalId) : null,
        verificadoPor: data.verificadoPor ? Number(data.verificadoPor) : null,
        
        foto_url: data.foto_url || null,
        foto_id: data.foto_id || null,
        descripcion: data.descripcion || null,

      }
    });
    
    return newSighting; 
  } catch (error) {
    console.error("Error registrando el avistamiento:", error);
    throw error;
  } 
}

// READ ALL
async function getAllSightings(idUsuario) {
  try {
    const sightings = await prisma.avistamiento.findMany({
      where: idUsuario ? { usuarioId: Number(idUsuario) } : undefined,
      include: {
        usuario: true, // Incluye el usuario que reportó
        animal: {
          include: {
            colonia: true // Incluye la colonia del animal
          }
        },
        verificador: true // Incluye el usuario que verificó
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return sightings;
  } catch (error) {
    console.error("Error obteniendo lista de avistamientos:", error);
    throw error;
  }
}

// READ ONE
async function getSightingById(idAvistamiento) {
  try {
    const sighting = await prisma.avistamiento.findUnique({
      where:  { idAvistamiento: Number(idAvistamiento) },
      include: {
        usuario: true,
        animal: {
          include: {
            colonia: true
          }
        },
        verificador: true
      }
    });

    return sighting;
  } catch (error) {
    console.error("Error obteniendo avistamiento:", error);
    throw error;
  }
}

// UPDATE
async function modifySighting(id, data) {
  try {
    const updateData = {};
    if (data.foto_url !== undefined) updateData.foto_url = data.foto_url;
    if (data.foto_id !== undefined) updateData.foto_id = data.foto_id;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.longitud !== undefined) updateData.longitud = data.longitud;
    if (data.latitud !== undefined) updateData.latitud = data.latitud;

    if (data.usuarioId !== undefined) {
      updateData.usuarioId = Number(data.usuarioId);
    }
    
    if (data.animalId !== undefined) {
      updateData.animalId = data.animalId ? Number(data.animalId) : null; 
    }

    if (data.verificado !== undefined) {
      updateData.verificado = data.verificado === true || data.verificado === 'true';
    }

    if (data.verificadoPor !== undefined) {
      const vId = Number(data.verificadoPor);
      updateData.verificadoPor = !isNaN(vId) && vId > 0 ? vId : null;
    }

    const updatedSighting = await prisma.avistamiento.update({
      where: { idAvistamiento: Number(id) },
      data: updateData
    });
    return updatedSighting;
  } catch (error) {
    console.error("Error actualizando avistamiento:", error);
    throw error;
  }
}

// DELETE
async function removeSighting(id) {
  try {
    const deletedSighting = await prisma.avistamiento.delete({
      where: { idAvistamiento: Number(id) }
    });
    return deletedSighting;
  } catch (error) {
    console.error("Error eliminando avistamiento:", error);
    throw error;
  }
}

module.exports = {
  createSighting,
  getAllSightings,
  getSightingById,
  modifySighting,
  removeSighting
}