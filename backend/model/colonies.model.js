const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// model Colonia {
//   idColonia   Int      @id @default(autoincrement())
//   nombre      String   @db.VarChar(100)
//   descripcion String   @db.VarChar(400)
//   zona        String   @db.VarChar(150)
//   createdAt   DateTime @default(now()) @map("created_at")

//   animales     Animal[]
//   usuariosCols UsuarioCol[]

//   @@map("Colonia")
// }

// CREATE
async function createColony(data) {
  try {

    let encargados = [];
    if (data.encargadosIds && data.encargadosIds.length > 0) {
      encargados = data.encargadosIds.map((id) => {
        return { Usuario_idUsuario: Number(id) };
      });
    }

    const newColony = await prisma.colonia.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        zona: data.zona || null,

        usuariosCols: {
          create: encargados
        }
      }
    });
    return newColony;
  } catch (error) {
    console.error("Error generando colonia:", error);
    throw error;
  } 
}

// READ ALL (Con filtro opcional por encargado)
async function getAllColonies(idEncargado) {
  try {
    const colonies = await prisma.colonia.findMany({
      where: idEncargado ? {
        usuariosCols: {
          some: {
            Usuario_idUsuario: Number(idEncargado) 
          }
        }
      } : undefined,
      include : {
        usuariosCols: {
          include: {
            usuario: {
              select: {
                idUsuario: true,
                nombre: true
              }
            }
          }
        }
      }
    });

    return colonies;
  } catch (error) {
    console.error("Error obteniendo lista de colonias:", error);
    throw error; 
  }
}

// READ PUBLIC
async function getColoniesPublic() {
  try {
    const colonies = await prisma.colonia.findMany({
      select: {
        idColonia: true,
        nombre: true,
        zona: true // Ubicación
      }
    });
    return colonies;
  } catch (error) {
    console.error("Error obteniendo colonias públicas:", error);
    throw error;
  }
}

// READ ONE
async function getColonyById(id) {
  try {
    const colony = await prisma.colonia.findUnique({
      where: { idColonia: Number(id) },
      include : {
        usuariosCols: {
          include: {
            usuario: {
              select: {
                idUsuario: true,
                nombre: true
              }
            }
          }
        }
      }
    });

    return colony;
  } catch (error) {
    console.error("Error buscando colonia por su id:", error);
    throw error;
  }
}

// UPDATE
async function updateColony(id, data) {
  try {
    const updateData = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.zona !== undefined) updateData.zona = data.zona;
    if (data.encargadosIds !== undefined && Array.isArray(data.encargadosIds)) {
      let encargados = [];
      encargados = data.encargadosIds.map((id) => {
        return { Usuario_idUsuario: Number(id) };
      });

      updateData.usuariosCols = {
        deleteMany: {},
        create: encargados
      }
    }

    const updatedColony = await prisma.colonia.update({
      where: { idColonia: Number(id) },
      data: updateData
    });

    return updatedColony;
  } catch (error) {
    console.error("Error actualizando colonia:", error);
    throw error;
  }
}

// DELETE
async function deleteColony(id) {
  try {
    const deletedColony = await prisma.colonia.delete({
      where: { idColonia: Number(id) }
    });
    return deletedColony;
  } catch (error) {
    console.error("Error eliminando colonia:", error);
    throw error;
  }
}

module.exports = {
  createColony,
  getAllColonies,
  getColoniesPublic,
  getColonyById,
  updateColony,
  deleteColony
};