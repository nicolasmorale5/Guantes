const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDatabase } = require('./config/database');

// Crear directorio de datos si no existe
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Inicializar base de datos y rutas
async function startServer() {
  try {
    // Inicializar base de datos primero
    await initializeDatabase();
    console.log('Base de datos inicializada correctamente');

    // Importar rutas después de inicializar la DB
    const authRoutes = require('./routes/auth');
    const divisasRoutes = require('./routes/divisas');
    const oficinasRoutes = require('./routes/oficinas');
    const citasRoutes = require('./routes/citas');

    // Rutas de la API
    app.use('/api/auth', authRoutes);
    app.use('/api/divisas', divisasRoutes);
    app.use('/api/oficinas', oficinasRoutes);
    app.use('/api/citas', citasRoutes);

    // Ruta de salud
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        mensaje: 'API Guantes de Oro funcionando correctamente',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });

    // Información de la API
    app.get('/api', (req, res) => {
      res.json({
        nombre: 'Guantes de Oro - API',
        version: '1.0.0',
        descripcion: 'API para casa de cambio Guantes de Oro',
        endpoints: {
          auth: '/api/auth',
          divisas: '/api/divisas',
          oficinas: '/api/oficinas',
          citas: '/api/citas',
          health: '/api/health'
        }
      });
    });

    // Manejo de errores 404
    app.use((req, res) => {
      res.status(404).json({ error: 'Ruta no encontrada' });
    });

    // Manejo de errores generales
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    });

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('=======================================================');
      console.log('                                                       ');
      console.log('     GUANTES DE ORO - Casa de Cambio                   ');
      console.log('                    API Server                         ');
      console.log('                                                       ');
      console.log(`     Servidor corriendo en: http://localhost:${PORT}      `);
      console.log('                                                       ');
      console.log('     Admin por defecto:                                ');
      console.log('     Email: admin@guantesdeoro.com                     ');
      console.log('     Pass:  admin123                                   ');
      console.log('                                                       ');
      console.log('=======================================================');
      console.log('');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
