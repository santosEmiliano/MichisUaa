const prisma = require('./prisma')
const bcrypt = require('bcryptjs');

async function main() {
  // Limpiar base de datos para evitar duplicados en cada seed
  await prisma.avistamiento.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.usuarioCol.deleteMany();
  await prisma.colonia.deleteMany();
  await prisma.usuario.deleteMany();

  // Crear colonias
  const colonia1 = await prisma.colonia.create({
    data: {
      nombre: 'Colonia Edificio 108',
      zona: 'Edificio 108',
      descripcion: 'Colonia principal zona central'
    }
  });

  const colonia2 = await prisma.colonia.create({
    data: {
      nombre: 'Colonia Zona Alberca',
      zona: 'Zona Norte',
      descripcion: 'Gatos que frecuentan las albercas'
    }
  });

  const colonia3 = await prisma.colonia.create({
    data: {
      nombre: 'Colonia Edificio 59',
      zona: 'Edificio 59',
      descripcion: 'Zona este del campus'
    }
  });

  // Crear usuario admin
  const saltos = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash('1234', saltos);

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Admin MichisUAA',
      email: 'admin@michis.uaa.mx',
      password: hashPassword,
      admin: true,
      usuariosCols: {
        create: [
          { Colonia_idColonia: colonia1.idColonia },
          { Colonia_idColonia: colonia2.idColonia }
        ]
      }
    }
  });

  // Crear Animales
  await prisma.animal.createMany({
    data: [
      { nombre: 'Manchas', Colonia_idColonia: colonia1.idColonia, esterilizado: true, estado: 'Registrado', fecha_nac: new Date('2023-01-15') },
      { nombre: 'Michi', Colonia_idColonia: colonia2.idColonia, esterilizado: true, estado: 'Registrado', fecha_nac: new Date('2021-05-10') },
      { nombre: 'Wakanda', Colonia_idColonia: colonia3.idColonia, esterilizado: true, estado: 'Registrado', fecha_nac: new Date('2022-08-22') },
      { nombre: 'Canela', Colonia_idColonia: colonia1.idColonia, esterilizado: false, estado: 'Registrado', fecha_nac: new Date('2020-11-05') },
      { nombre: 'Julián', Colonia_idColonia: colonia2.idColonia, esterilizado: false, estado: 'NoRegistrado', fecha_nac: new Date('2023-12-01') },
      { nombre: 'José', Colonia_idColonia: colonia3.idColonia, esterilizado: false, estado: 'Desaparecido', fecha_nac: new Date('2019-03-30') },
      { nombre: 'Santos', Colonia_idColonia: colonia3.idColonia, esterilizado: true, estado: 'Registrado', fecha_nac: new Date('2022-02-14') },
      { nombre: 'Harim', Colonia_idColonia: colonia3.idColonia, esterilizado: true, estado: 'Desaparecido', fecha_nac: new Date('2021-09-09') },
      { nombre: 'Luna', Colonia_idColonia: colonia2.idColonia, esterilizado: true, estado: 'Registrado', fecha_nac: new Date('2024-01-01') },
      { nombre: 'Tigre', Colonia_idColonia: colonia1.idColonia, esterilizado: false, estado: 'Registrado', fecha_nac: new Date('2018-07-20') },
      { nombre: 'Wakanda', Colonia_idColonia: colonia3.idColonia, esterilizado: true, estado: 'Registrado', fecha_nac: new Date('2022-08-22') },
      { nombre: 'Canela', Colonia_idColonia: colonia1.idColonia, esterilizado: false, estado: 'Registrado', fecha_nac: new Date('2020-11-05') },
      { nombre: 'Julián', Colonia_idColonia: colonia2.idColonia, esterilizado: false, estado: 'NoRegistrado', fecha_nac: new Date('2023-12-01') },
    ]
  });

  console.log('Seed completado')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())