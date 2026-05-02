const prisma = require('./prisma')

async function main() {
  const colonia1 = await prisma.colonia.create({
    data: {
      nombre: 'Colonia Edificio 108',
      zona: 'Edificio 108',
      descripcion: 'Colonia principal zona central'
    }
  })

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Admin MichisUAA',
      email: 'admin@michis.uaa.mx',
      password: '1234', // después de conectar bcrypt aquí va el hash
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