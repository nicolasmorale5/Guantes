# Guantes de Oro - Casa de Cambio

Aplicación web y móvil para la casa de cambio Guantes de Oro en Barranquilla, Colombia.

## Características

- **Simulador de cambio de divisas** - Calcula conversiones en tiempo real
- **Tasas de cambio actualizadas** - Ver todas las tasas disponibles
- **Agendar citas** - Programa tu visita a cualquiera de nuestras oficinas
- **Consultar/Cancelar citas** - Gestiona tus citas con tu código de confirmación
- **Panel de administración** - Para gestionar tasas, citas y oficinas

## Estructura del Proyecto

```
guantes-de-oro/
├── backend/          # API REST con Express.js
├── web/              # Aplicación web con React + Vite
├── mobile/           # Aplicación móvil con React Native + Expo
└── shared/           # Código compartido
```

## Oficinas

- **Sucursal Riomar**: Cl. 93 #46-90 Local 2, Riomar, Barranquilla
- **Aeropuerto Ernesto Cortissoz**: Soledad, Atlántico

## Instalación

### Backend

```bash
cd backend
npm install
npm run dev
```

El servidor se ejecutará en `http://localhost:3001`

### Web

```bash
cd web
npm install
npm run dev
```

La aplicación se ejecutará en `http://localhost:3000`

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## Credenciales de Administrador

- **Email**: admin@guantesdeoro.com
- **Password**: admin123

## API Endpoints

### Públicos
- `GET /api/divisas` - Lista de divisas
- `GET /api/divisas/tasas` - Tasas de cambio
- `POST /api/divisas/convertir` - Convertir divisas
- `GET /api/oficinas` - Lista de oficinas
- `POST /api/citas` - Crear cita
- `GET /api/citas/consultar/:codigo` - Consultar cita
- `POST /api/citas/cancelar/:codigo` - Cancelar cita
- `GET /api/citas/disponibilidad/:oficina_id/:fecha` - Horarios disponibles

### Protegidos (requieren autenticación)
- `POST /api/auth/login` - Iniciar sesión
- `PUT /api/divisas/tasas/:id` - Actualizar tasa
- `GET /api/citas` - Listar todas las citas
- `PUT /api/citas/:id/estado` - Actualizar estado de cita
- Gestión de oficinas (CRUD)

## Tecnologías

- **Backend**: Node.js, Express, SQLite (better-sqlite3), JWT
- **Web**: React 18, Vite, React Router
- **Mobile**: React Native, Expo, React Navigation

## Despliegue

### Vercel (Web)
El proyecto está configurado para desplegarse en Vercel. Solo conecta el repositorio.

### Expo (Mobile)
```bash
cd mobile
npx expo build:android
npx expo build:ios
```

## Licencia

MIT
