const { getDefaultConfig } = require('expo/metro-config');

// El alias de `react-native-maps` -> `@teovilla/react-native-web-maps` que vivía
// aquí nunca llegaba a ejecutarse: en web, Metro resuelve `@/components/Map`
// hacia `components/Map.web.tsx`, que usa pigeon-maps directamente y jamás
// importa `react-native-maps`. Se quitó para no dar a entender que el mapa web
// depende de ese paquete.
const config = getDefaultConfig(__dirname);

module.exports = config;
