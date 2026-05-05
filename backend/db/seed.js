const prisma = require('./prisma')
const bcrypt = require('bcryptjs');

async function main() {
  // Limpiar BD (opcional, pero útil para correr el seed múltiples veces)
  await prisma.animal.deleteMany();
  await prisma.usuarioCol.deleteMany();
  await prisma.colonia.deleteMany();
  await prisma.usuario.deleteMany();

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
        create: { Colonia_idColonia: createdColonies[0].idColonia } // Admin assigned to the first colony by default
      }
    }
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

  console.log('Seed completado exitosamente.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());