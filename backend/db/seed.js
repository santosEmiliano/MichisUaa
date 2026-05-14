const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

async function main() {
  // Limpiar base de datos para evitar duplicados en cada seed
  await prisma.avistamiento.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.usuarioCol.deleteMany();
  await prisma.colonia.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('Creando colonias...');
  const coloniesData = [
    { nombre: 'Edificio 108', zona: 'Zona central', descripcion: 'Colonia principal frente a la biblioteca central.' },
    { nombre: 'Zona alberca', zona: 'Area deportiva', descripcion: 'Jardines alrededor de la alberca universitaria.' },
    { nombre: 'UMD', zona: 'Unidad médico-didáctica', descripcion: 'Estacionamiento y entrada principal de UMD.' },
    { nombre: 'Edificio 114', zona: 'Zona noreste', descripcion: 'Pasillo B y área de jardines cercanos a la cafetería norte.' },
    { nombre: 'Edificio 117', zona: 'Zona sur', descripcion: 'Jardines exteriores del edificio 117, límite contra plaza universidad.' },
    { nombre: 'Edificio 59', zona: 'Zona este', descripcion: 'Zona de los laboratorios de electrónica y sistemas.' },
    { nombre: 'Jardín Botánico', zona: 'Zona oeste', descripcion: 'Área protegida con abundante vegetación y refugios naturales.' },
    { nombre: 'Velaria', zona: 'Explanada', descripcion: 'Zona techada donde se realizan eventos masivos.' },
    { nombre: 'Edificio 20', zona: 'Zona antigua', descripcion: 'Cerca de los primeros edificios de la universidad.' },
    { nombre: 'Biblioteca Norte', zona: 'Zona norte', descripcion: 'Jardines traseros de la biblioteca norte.' },
  ];

  const createdColonies = [];
  for (const c of coloniesData) {
    const col = await prisma.colonia.create({ data: c });
    createdColonies.push(col);
  }

  console.log('Creando usuarios...');
  const saltos = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash('1234', saltos);

  const usersData = [
    { nombre: 'Admin MichisUAA', email: 'admin@michis.uaa.mx', admin: true },
    { nombre: 'Emiliano Santos', email: 'esantos@michis.uaa.mx', admin: true },
    { nombre: 'Mario Rodriguez', email: 'mrodriguez@michis.uaa.mx', admin: true },
    { nombre: 'Héctor Dueñas', email: 'hduenas@michis.uaa.mx', admin: false },
    { nombre: 'Juan Hernandez', email: 'jhernandez@michis.uaa.mx', admin: false },
    { nombre: 'Javier Narvaez', email: 'jnarvaez@michis.uaa.mx', admin: false },
    { nombre: 'Brenda Osorio', email: 'bosorio@michis.uaa.mx', admin: false },
    { nombre: 'Ana Gomez', email: 'agomez@michis.uaa.mx', admin: false },
    { nombre: 'Carlos Lopez', email: 'clopez@michis.uaa.mx', admin: false },
    { nombre: 'Laura Martinez', email: 'lmartinez@michis.uaa.mx', admin: false },
  ];

  const createdUsers = [];
  for (let i = 0; i < usersData.length; i++) {
    const u = usersData[i];
    // Asignar a 2 colonias aleatorias a cada usuario
    const col1 = createdColonies[i % createdColonies.length].idColonia;
    const col2 = createdColonies[(i + 3) % createdColonies.length].idColonia;

    const user = await prisma.usuario.create({
      data: {
        nombre: u.nombre,
        email: u.email,
        password: hashPassword,
        admin: u.admin,
        usuariosCols: {
          create: [
            { Colonia_idColonia: col1 },
            { Colonia_idColonia: col2 }
          ]
        }
      }
    });
    createdUsers.push(user);
  }

  const adminUsers = createdUsers.filter(u => u.admin);

  console.log('Creando animales variados...');
  const catNames = [
    'Manchas', 'Michi', 'Wakanda', 'Canela', 'Gatillo', 'Jose Pablo', 'Chispas', 'Kneecap', 'Luna', 'Tigre',
    'Garfield', 'Felix', 'Salem', 'Pelusa', 'Tom', 'Silvestre', 'Bola de Nieve', 'Botas', 'Simba', 'Nala',
    'Oreo', 'Pantera', 'Romeo', 'Benito', 'Cucho', 'Demostenes', 'Espanto', 'Don Gato', 'Copito', 'Misifu',
    'Mish', 'Zeus', 'Apolo', 'Loki', 'Thor', 'Mia', 'Kira', 'Coco', 'Milo', 'Leo'
  ];

  const createdAnimals = [];
  let nameIndex = 0;

  for (let i = 0; i < createdColonies.length; i++) {
    const colonyId = createdColonies[i].idColonia;
    // Crear entre 3 y 5 gatos por colonia
    const numCats = Math.floor(Math.random() * 3) + 3; 

    for (let j = 0; j < numCats; j++) {
      if (nameIndex >= catNames.length) nameIndex = 0;
      
      const isEsterilizado = Math.random() > 0.3; // 70% esterilizados
      const estadoOptions = ['Registrado', 'Registrado', 'Registrado', 'Desaparecido', 'NoRegistrado'];
      const estado = estadoOptions[Math.floor(Math.random() * estadoOptions.length)];
      
      const birthYear = 2018 + Math.floor(Math.random() * 6);
      const birthMonth = Math.floor(Math.random() * 12);
      const fechaNac = new Date(birthYear, birthMonth, 15);
      
      let fechaEsterilizacion = null;
      if (isEsterilizado) {
        const estYear = birthYear + 1 + Math.floor(Math.random() * 2);
        fechaEsterilizacion = new Date(estYear, birthMonth, 10);
      }

      // Generar una fecha de creación variada (80% antiguos, 20% recientes)
      const isReciente = Math.random() < 0.2;
      const createdAt = new Date();
      if (isReciente) {
        // En los últimos 6 días
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 6));
      } else {
        // Hace 10 a 300 días
        createdAt.setDate(createdAt.getDate() - (10 + Math.floor(Math.random() * 290)));
      }

      const animal = await prisma.animal.create({
        data: {
          nombre: catNames[nameIndex],
          Colonia_idColonia: colonyId,
          esterilizado: isEsterilizado,
          estado: estado,
          fecha_nac: fechaNac,
          fecha_esterilizacion: fechaEsterilizacion,
          descripcion: `Un gato muy peculiar llamado ${catNames[nameIndex]}, visto frecuentemente en la colonia.`,
          createdAt: createdAt
        }
      });
      createdAnimals.push(animal);
      nameIndex++;
    }
  }

  console.log('Creando avistamientos...');
  const baseLat = 21.913;
  const baseLng = -102.314;

  for (let i = 0; i < 30; i++) {
    const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const randomAnimal = Math.random() > 0.2 ? createdAnimals[Math.floor(Math.random() * createdAnimals.length)] : null; // 20% sin identificar
    const randomAdmin = adminUsers[Math.floor(Math.random() * adminUsers.length)];

    const latOffset = (Math.random() - 0.5) * 0.005;
    const lngOffset = (Math.random() - 0.5) * 0.005;
    
    const daysAgo = Math.floor(Math.random() * 60); // Hace 0 a 60 días
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    // Tipos de estado: Pendiente, Verificado, Rechazado
    const statusRand = Math.random();
    let verificado = false;
    let verificadoPor = null;
    let desc = '';

    if (randomAnimal === null) {
       desc = 'Vi un gato que no parece estar en la base de datos, cerca de los árboles.';
       // Algunos sin identificar quedan pendientes, otros son rechazados
       if (statusRand > 0.7) {
          verificadoPor = randomAdmin.idUsuario; // Rechazado
       }
    } else {
       if (statusRand < 0.4) {
         // Verificado
         verificado = true;
         verificadoPor = randomAdmin.idUsuario;
         desc = `Confirmado, vi a ${randomAnimal.nombre} descansando.`;
       } else if (statusRand < 0.6) {
         // Rechazado
         verificadoPor = randomAdmin.idUsuario;
         desc = `Creo que vi a ${randomAnimal.nombre}, aunque estaba un poco lejos.`;
       } else {
         // Pendiente
         desc = `Reporte de ${randomAnimal.nombre} en la zona.`;
       }
    }

    await prisma.avistamiento.create({
      data: {
        usuarioId: randomUser.idUsuario,
        animalId: randomAnimal ? randomAnimal.idAnimal : null,
        descripcion: desc,
        longitud: baseLng + lngOffset,
        latitud: baseLat + latOffset,
        verificado: verificado,
        verificadoPor: verificadoPor,
        createdAt: createdAt
      }
    });
  }

  console.log('Seed completado exitosamente con datos variados y completos.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());