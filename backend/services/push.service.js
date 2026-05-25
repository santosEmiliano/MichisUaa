// services/push.service.js
const { Expo } = require('expo-server-sdk')
const expo = new Expo()

const sendPushNotification = async (pushToken, { titulo, descripcion }) => {
  if (!Expo.isExpoPushToken(pushToken)) return

  await expo.sendPushNotificationsAsync([{
    to: pushToken,
    title: titulo,
    body: descripcion,
    sound: 'default',
    data: { url: '/avistamientos' }
  }])
}

module.exports = { sendPushNotification }