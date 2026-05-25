const { Expo } = require('expo-server-sdk');
const expo = new Expo();

// Obtener el push token desde los argumentos de la línea de comandos
const pushToken = process.argv[2];

if (!pushToken) {
  console.error('\x1b[31mError: Por favor, proporciona un push token.\x1b[0m');
  console.log('\nUso:');
  console.log('  node test-push.js <EXPO_PUSH_TOKEN>');
  console.log('\nEjemplo:');
  console.log('  node test-push.js ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]');
  process.exit(1);
}

if (!Expo.isExpoPushToken(pushToken)) {
  console.error(`\x1b[31mError: "${pushToken}" no es un token de push de Expo válido.\x1b[0m`);
  process.exit(1);
}

const sendTestNotification = async () => {
  console.log(`Enviando notificación de prueba a: ${pushToken}...`);
  
  const messages = [{
    to: pushToken,
    sound: 'default',
    title: '¡Michi avistado! 🐾',
    body: 'Se ha reportado un nuevo avistamiento de michi en el campus.',
    data: { url: '/avistamientos' },
  }];

  try {
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    
    for (let chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('Ticket recibido:', ticketChunk);
      tickets.push(...ticketChunk);
    }
    
    console.log('\n\x1b[32m¡Notificación enviada correctamente! 🚀\x1b[0m');
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
  }
};

sendTestNotification();
