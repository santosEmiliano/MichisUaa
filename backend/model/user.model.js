const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addUser(nombre, email, password, admin) {
  try {
    const newUser = await prisma.usuario.create({
      data: {
        nombre: nombre,
        email: email,
        password: password,
        admin: admin
      }
    });
    return newUser.idUsuario;
  } catch (error) {
    console.error("Error agregando usuario:", error);
    return null;
  } 
}

async function getUsers() {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        idUsuario: true,
        nombre: true,
        email: true,
        admin: true,
        createdAt: true
      }
    });
    return users;
  } catch (error) {
    console.error("Error obteniendo lista de usuarios:", error);
    throw error;
  }
}

async function occupied(nombre, email) {
  try {
    const user = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: email },
          { nombre: nombre }
        ]
      }
    });

    return user ? user.idUsuario : null;
  } catch (error) {
    console.error("Error en la busqueda de usuario (occupied):", error);
    return null;
  } 
}

async function searchId(id) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { idUsuario: id },
      select: {
        idUsuario: true,
        nombre: true,
        email: true,
        admin: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.idUsuario,
      nombre: user.nombre,
      email: user.email,
      admin: user.admin 
    };
  } catch (error) {
    console.error("Error buscando usuario por id:", error);
    return null;
  }
}

async function searchMail(email) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { email: email }
    });
    
    return user || null;
  } catch (error) {
    console.error("Error buscando usuario por correo:", error);
    return null;
  }
}

module.exports = {
    addUser,
    getUsers,
    occupied,
    searchId,
    searchMail
}