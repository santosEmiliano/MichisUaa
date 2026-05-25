# MichisUAA

Repositorio oficial del proyecto MichisUAA. Esta aplicación móvil conecta a la comunidad universitaria para monitorear y registrar avistamientos de felinos dentro de las instalaciones de la universidad, utilizando React Native, Google Maps SDK y Firebase Cloud Messaging.

---

## Requisitos de Desarrollo

Debido a la integración de módulos nativos (Google Maps y Push Notifications), la aplicación ha dejado de ser compatible con el cliente estándar de Expo Go. El equipo de desarrollo debe contar con las siguientes herramientas instaladas y configuradas:

- Node.js (Versión LTS)
- Android Studio (Con emulador Android virtualizado)
- Java Development Kit (JDK 17)

---

## Directrices de Configuración Frontend

Para garantizar la correcta ejecución del entorno local, todos los desarrolladores deben acatar las siguientes directrices al trabajar sobre el directorio `mobile-app`:

### 1. Actualización de Dependencias
Siempre que se integren cambios del repositorio remoto (`git pull`), es fundamental sincronizar los módulos de Node ejecutando:
```bash
npm install
```

### 2. Variables de Entorno (.env)
El archivo `.env` se encuentra ignorado por control de versiones por motivos de seguridad y configuración de red. Cada miembro del equipo debe crear un archivo `.env` local en la raíz de `mobile-app`. 

Es imperativo definir la variable `EXPO_PUBLIC_BACKEND_IP` apuntando a la dirección IPv4 local del equipo que esté ejecutando la instancia del backend:
```env
EXPO_PUBLIC_BACKEND_IP=192.168.X.X
```
*(Se puede obtener la dirección ejecutando `ipconfig` en sistemas Windows o `ifconfig` en sistemas Unix).*

### 3. Compilación Nativa (Local)
El comando habitual de desarrollo (`npx expo start`) no es suficiente para cargar los binarios requeridos por los módulos nativos. Es mandatorio compilar la aplicación para la plataforma destino utilizando:
```bash
npx expo run:android
```
Este comando inicializará el proceso de Gradle, compilará el código fuente nativo e instalará la aplicación directamente en el emulador configurado. Requiere Android Studio y JDK.

### 4. Alternativa: Desarrollo en la Nube (Expo Dev Client)
Si un desarrollador no puede instalar Android Studio localmente, puede generar una compilación de desarrollo (Development Build) en los servidores en la nube de Expo. 
1. Ejecutar el siguiente comando para generar la compilación en la nube:
   ```bash
   eas build --profile development --platform android
   ```
2. Descargar el archivo `.apk` resultante e instalarlo en un celular físico o emulador.
3. Iniciar el servidor de empaquetado normal:
   ```bash
   npx expo start
   ```
4. Escanear el código QR desde el celular (o presionar `a` en la terminal) para inyectar el código local dentro de la aplicación nativa construida en la nube.

### 5. Distribución de Versiones de Prueba (Testing)
En caso de requerir que miembros del equipo (QA, Diseño) prueben la aplicación sin configurar el entorno de Android Studio, se debe generar un artefacto instalable (`.apk`). Para ello, ejecutar:
```bash
eas build -p android --profile development
```

---

## Ejecución del Proyecto

1. **Backend:** Iniciar la base de datos y levantar la instancia del servidor Node.js según los flujos de trabajo habituales del equipo.
2. **Frontend:** Navegar al directorio `mobile-app`, verificar dependencias, configurar archivo `.env` y ejecutar `npx expo run:android`.

---

## Checklist para Paso a Producción (Deployment)

Antes de lanzar la aplicación a los usuarios finales de la universidad o subirla a la Play Store, es rigurosamente necesario completar las siguientes tareas arquitectónicas y de seguridad:

* [ ] **Cuentas y Propiedad:** Migrar los proyectos de Google Cloud Platform y Firebase de la cuenta personal actual hacia una cuenta institucional oficial y compartida de la UAA.
* [ ] **Restricción de API Keys (Google Maps):** Ingresar a Google Cloud Console y restringir la API Key de Google Maps para que únicamente acepte peticiones de la huella digital criptográfica (SHA-1 de Producción) de la aplicación compilada.
* [ ] **Despliegue del Servidor (Backend):** Migrar el código del servidor Node.js de la máquina local a una infraestructura en la nube (ej. Render, AWS, Heroku) con soporte SSL/HTTPS.
* [ ] **Actualización de Variables (IP a Dominio):** Eliminar la dirección IPv4 local del archivo `.env` en el Frontend y reemplazar `EXPO_PUBLIC_BACKEND_IP` por el dominio público definitivo del nuevo servidor web.
* [ ] **Despliegue de Base de Datos:** Alojar la base de datos MySQL local en un servicio administrado en la nube (ej. AWS RDS, PlanetScale, Railway) y actualizar las credenciales de conexión en el backend.
* [ ] **Compilación de Producción:** Utilizar EAS Build para generar el Android App Bundle (`.aab`) optimizado para la Play Store (`eas build -p android --profile production`), y actualizar las credenciales generadas de FCM V1 con el entorno de producción.