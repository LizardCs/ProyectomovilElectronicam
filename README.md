# 🛠️ PROYECTO MOVIL PARA ELECTRONICA MANTILLA

Bienvenido al **Sistema de Gestión Móvil de Electrónica Mantilla**.  
Este proyecto es una **aplicación universal desarrollada con Expo y React Native**, diseñada para **digitalizar el flujo de trabajo** entre **administradores** y **técnicos de servicio**.

---

## 🚀 Empecemos (Get Started)

Sigue estos pasos para configurar el entorno de desarrollo local.

---

## 📦 Instalación de Dependencias

Asegúrate de tener **Node.js** instalado y ejecuta:

```bash
npm install
```bash

##  ▶️ Iniciar la Aplicación
Ejecuta:

```bash
npx expo start
```bash

En la terminal se mostrará un código QR. Puedes abrir la app en:

- 📱 Dispositivo físico: Escanea el QR con la aplicacion de Expo Go

- 🤖 Emulador Android: Presiona a

- 🍎 Simulador iOS: Presiona i

📂 Estructura del Proyecto
Este proyecto utiliza File-based routing a través de expo-router.


PROYECTOMOVILELECTRONICAM/
│
├── app/                        # Rutas y Pantallas
│   ├── index.js                # Login Principal
│   ├── (main)/                 # Flujo de trabajo técnico
│   │   ├── home.js             # Dashboard general
│   │   ├── detalle/[id].js     # Ver detalles del servicio
│   │   └── reporte/[id].js     # Generar reportes técnicos
│   ├── admin/
│   │   └── home.js             # Panel de gestión de Administrador
│   └── tecnico/
│       └── home.js             # Panel de tareas del Técnico
│
├── components/                 # Componentes de UI reutilizables
├── services/                   # Lógica de datos
│   ├── api.js                  # Conexión con servidor PHP
│   └── mockUsers.js            # Datos de prueba
└── assets/                     # Imágenes y recursos institucionales


##  ✨ Funcionalidades Principales
- Gestión de Acceso
- Login Inteligente
- Redirección automática según rol:
- Sesión Persistente

##  👔 Perfil Administrador
- Dashboard con estadísticas en tiempo real
- Visualización de servicios Pendientes y Completados
- Gestión de usuarios
- Creación y asignación dinámica de servicios técnicos

##  🔧 Perfil Técnico
- Listado de trabajos asignados
- Buscador por número de servicio
- Estados visuales claros:
   -🟢 Completado

   - 🟠 Pendiente

- Navegación a detalles del servicio
- Generación automatica de reportes técnicos 

##  🛠️ Tecnologías Utilizadas.

- Framework: Expo (React Native)

- Navegación: expo-router

- Almacenamiento: @react-native-async-storage/async-storage

- Iconos: Ionicons (@expo/vector-icons)

- Animaciones: API nativa Animated


© 2025 Johan Curicho to Electronica Mantilla
- Sistema de Gestión Técnica y Rerpotes automaticos.
