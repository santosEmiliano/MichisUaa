const prisma = require('./prisma')
const bcrypt = require('bcryptjs');

async function main() {
  const colonia1 = await prisma.colonia.create({
    data: {
      nombre: 'Colonia Edificio 108',
      zona: 'Edificio 108',
      descripcion: 'Colonia principal zona central'
    }
  })

  const saltos = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash('1234', saltos);

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Admin MichisUAA',
      email: 'admin@michis.uaa.mx',
      password: hashPassword,
      admin: true,
      usuariosCols: {
        create: { Colonia_idColonia: colonia1.idColonia }
      }
    }
  })

  await prisma.animal.create({
    data: {
      nombre: 'Manchas',
      Colonia_idColonia: colonia1.idColonia,
      esterilizado: true,
      estado: 'Registrado'
    }
  })

  console.log('Seed completado')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())