const prisma = require('./prisma')
const bcrypt = require('bcryptjs');

async function main() {
  // Limpiar base de datos para evitar duplicados en cada seed
  await prisma.avistamiento.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.usuarioCol.deleteMany();
  await prisma.colonia.deleteMany();
  await prisma.usuario.deleteMany();

  // Crear usuario admin
  const saltos = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash('1234', saltos);

  console.log('Creando colonias...');
  const coloniesData = [
    { nombre: 'Edificio 108', zona: 'Zona central - Ed. 108', descripcion: 'Colonia principal del área central, frente a la entrada a la biblioteca central.' },
    { nombre: 'Zona alberca', zona: 'Area deportiva - Alberca', descripcion: 'Colonia ubicada en los jardines alrededor de la alberca universitaria.' },
    { nombre: 'UMD', zona: 'Unidad médico-didáctica', descripcion: 'Colonia en zona de estacionamiento y entrada principal de UMD.' },
    { nombre: 'Edificio 114', zona: 'Zona noreste - Ed. 114', descripcion: 'Colonia en pasillo B y área de jardines del edificio 114 cercano a la cafeteria norte.' },
    { nombre: 'Edificio 117', zona: 'Zona sur - Ed. 117', descripcion: 'Colonia en jardines exteriores del edificio 117, límite del campus contra plaza universidad.' },
    { nombre: 'Edificio 59', zona: 'Zona este - Ed. 59', descripcion: 'Colonia en zona de los laboratorios de electrónica y edificio de sistemas.' },
  ];

  const createdColonies = [];
  for (const c of coloniesData) {
    const col = await prisma.colonia.create({ data: c });
    createdColonies.push(col);
  }


  const colonia1 = createdColonies[0];
  const colonia2 = createdColonies[1];
  const colonia3 = createdColonies[5];

  console.log('Creando usuarios y asignando colonias...');
  const usersData = [
    { nombre: 'M. Rodriguez', email: 'mrodriguez@michis.uaa.mx', colIndex: 0 },
    { nombre: 'E. Santos', email: 'esantos@michis.uaa.mx', colIndex: 1 },
    { nombre: 'H. Dueñas', email: 'hduenas@michis.uaa.mx', colIndex: 2 },
    { nombre: 'J. Hernandez', email: 'jhernandez@michis.uaa.mx', colIndex: 3 },
    { nombre: 'J. Narvaez', email: 'jnarvaez@michis.uaa.mx', colIndex: 4 },
    { nombre: 'B. Osorio', email: 'bosorio@michis.uaa.mx', colIndex: 5 },
  ];

  for (const u of usersData) {
    await prisma.usuario.create({
      data: {
        nombre: u.nombre,
        email: u.email,
        password: hashPassword,
        admin: false,
        usuariosCols: {
          create: { Colonia_idColonia: createdColonies[u.colIndex].idColonia }
        }
      }
    });
  }

  // Admin User
  await prisma.usuario.create({
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

  // Adding some random animals to populate the stats
  console.log('Creando animales...');
  const animalCounts = [12, 8, 8, 5, 9, 10]; // From the image
  const esterilizadoCounts = [10, 6, 6, 2, 8, 5]; // Calculated roughly from the percentages in the image

  for (let i = 0; i < createdColonies.length; i++) {
    const colonyId = createdColonies[i].idColonia;
    const total = animalCounts[i];
    const esterilizados = esterilizadoCounts[i];

    for (let j = 0; j < total; j++) {
      await prisma.animal.create({
        data: {
          nombre: `Gato ${i+1}-${j+1}`,
          Colonia_idColonia: colonyId,
          esterilizado: j < esterilizados,
          estado: 'Registrado'
        }
      });
    }
  }
  
  const firstUser = await prisma.usuario.findFirst();
  const firstAnimal = await prisma.animal.findFirst();

  if (firstUser) {
    const today = new Date();
    
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(today.getDate() - 5);
    
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - 10);
    
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);

    // Obtener un animal de cada colonia para distribuir los avistamientos
    const animalsPerColony = await Promise.all(
      createdColonies.map(col => 
        prisma.animal.findFirst({ where: { Colonia_idColonia: col.idColonia } })
      )
    );

    await prisma.avistamiento.createMany({
      data: [
        { usuarioId: firstUser.idUsuario, animalId: animalsPerColony[0]?.idAnimal, longitud: -102.316, latitud: 21.914, createdAt: today },
        { usuarioId: firstUser.idUsuario, animalId: animalsPerColony[1]?.idAnimal, longitud: -102.315, latitud: 21.913, createdAt: threeDaysAgo },
        { usuarioId: firstUser.idUsuario, animalId: animalsPerColony[2]?.idAnimal, longitud: -102.314, latitud: 21.912, createdAt: fiveDaysAgo },
        { usuarioId: firstUser.idUsuario, animalId: animalsPerColony[3]?.idAnimal, longitud: -102.313, latitud: 21.911, createdAt: today },
        { usuarioId: firstUser.idUsuario, animalId: animalsPerColony[4]?.idAnimal, longitud: -102.312, latitud: 21.910, createdAt: threeDaysAgo },
        { usuarioId: firstUser.idUsuario, animalId: animalsPerColony[5]?.idAnimal, longitud: -102.311, latitud: 21.909, createdAt: fiveDaysAgo },
        // Algunos avistamientos viejos para la tendencia
        { usuarioId: firstUser.idUsuario, animalId: animalsPerColony[0]?.idAnimal, longitud: -102.316, latitud: 21.914, createdAt: tenDaysAgo },
        { usuarioId: firstUser.idUsuario, animalId: animalsPerColony[1]?.idAnimal, longitud: -102.315, latitud: 21.913, createdAt: twoWeeksAgo },
      ]
    });
  }

  console.log('Seed completado exitosamente.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());