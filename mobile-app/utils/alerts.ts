  import { Platform, Alert } from 'react-native';
  
  // Función para mostrar alertas compatibles con Web y Móvil
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  export { showAlert };