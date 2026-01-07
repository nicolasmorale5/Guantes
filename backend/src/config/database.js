const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Use /tmp for Vercel or local data folder
const isVercel = process.env.VERCEL === '1';
const dbDir = isVercel ? '/tmp' : path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'guantes.db');

// Ensure data directory exists (only for local)
if (!isVercel && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database wrapper to mimic better-sqlite3 API
class DatabaseWrapper {
  constructor(sqlJsDb) {
    this.db = sqlJsDb;
    this.dbPath = dbPath;
  }

  exec(sql) {
    this.db.run(sql);
    this.save();
  }

  prepare(sql) {
    const self = this;
    return {
      get(...params) {
        const stmt = self.db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        if (stmt.step()) {
          const result = stmt.getAsObject();
          stmt.free();
          return result;
        }
        stmt.free();
        return undefined;
      },
      all(...params) {
        const results = [];
        const stmt = self.db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      run(...params) {
        const stmt = self.db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        stmt.step();
        stmt.free();
        self.save();
        return {
          changes: self.db.getRowsModified(),
          lastInsertRowid: self.getLastInsertRowid()
        };
      }
    };
  }

  getLastInsertRowid() {
    const stmt = this.db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result.id;
  }

  save() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }
}

let db = null;
let dbReady = false;
let dbInitPromise = null;

async function initDatabase() {
  if (dbReady) return db;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    const SQL = await initSqlJs();

    let sqlJsDb;
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      sqlJsDb = new SQL.Database(fileBuffer);
    } else {
      sqlJsDb = new SQL.Database();
    }

    db = new DatabaseWrapper(sqlJsDb);
    dbReady = true;
    return db;
  })();

  return dbInitPromise;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Crear tablas
async function initializeDatabase() {
  const db = await initDatabase();

  // Tabla de usuarios (administradores)
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rol TEXT DEFAULT 'admin',
      activo INTEGER DEFAULT 1,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de divisas
  db.exec(`
    CREATE TABLE IF NOT EXISTS divisas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      simbolo TEXT NOT NULL,
      activo INTEGER DEFAULT 1
    )
  `);

  // Tabla de tasas de cambio
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasas_cambio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      divisa_origen TEXT NOT NULL,
      divisa_destino TEXT NOT NULL,
      tasa_compra REAL NOT NULL,
      tasa_venta REAL NOT NULL,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_por INTEGER,
      FOREIGN KEY (actualizado_por) REFERENCES usuarios(id)
    )
  `);

  // Tabla de oficinas
  db.exec(`
    CREATE TABLE IF NOT EXISTS oficinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      direccion TEXT NOT NULL,
      telefono TEXT,
      horario TEXT,
      latitud REAL,
      longitud REAL,
      activo INTEGER DEFAULT 1
    )
  `);

  // Tabla de citas
  db.exec(`
    CREATE TABLE IF NOT EXISTS citas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_cita TEXT UNIQUE NOT NULL,
      nombre_cliente TEXT NOT NULL,
      telefono_cliente TEXT NOT NULL,
      email_cliente TEXT,
      oficina_id INTEGER NOT NULL,
      fecha DATE NOT NULL,
      hora TIME NOT NULL,
      divisa_origen TEXT NOT NULL,
      divisa_destino TEXT NOT NULL,
      monto REAL NOT NULL,
      estado TEXT DEFAULT 'pendiente',
      notas TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oficina_id) REFERENCES oficinas(id)
    )
  `);

  // Insertar datos iniciales si no existen
  insertarDatosIniciales(db);
}

function insertarDatosIniciales(db) {
  // Verificar si ya hay datos
  const hayUsuarios = db.prepare('SELECT COUNT(*) as count FROM usuarios').get();

  if (hayUsuarios.count === 0) {
    // Crear usuario admin por defecto
    const passwordHash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES (?, ?, ?, ?)
    `).run('Administrador', 'admin@guantesdeoro.com', passwordHash, 'admin');

    // Insertar divisas
    const divisas = [
      ['USD', 'Dólar Estadounidense', '$'],
      ['EUR', 'Euro', '€'],
      ['MXN', 'Peso Mexicano', '$'],
      ['GBP', 'Libra Esterlina', '£'],
      ['CAD', 'Dólar Canadiense', 'C$'],
      ['JPY', 'Yen Japonés', '¥'],
      ['BRL', 'Real Brasileño', 'R$'],
      ['COP', 'Peso Colombiano', '$'],
      ['ARS', 'Peso Argentino', '$'],
      ['CLP', 'Peso Chileno', '$']
    ];

    const insertDivisa = db.prepare('INSERT INTO divisas (codigo, nombre, simbolo) VALUES (?, ?, ?)');
    divisas.forEach(d => insertDivisa.run(...d));

    // Insertar tasas de cambio (basadas en COP - Peso Colombiano)
    const tasas = [
      ['USD', 'COP', 4150.00, 4250.00],
      ['EUR', 'COP', 4500.00, 4620.00],
      ['GBP', 'COP', 5200.00, 5350.00],
      ['CAD', 'COP', 3050.00, 3150.00],
      ['MXN', 'COP', 240.00, 255.00],
      ['BRL', 'COP', 830.00, 870.00],
      ['ARS', 'COP', 4.80, 5.20],
      ['CLP', 'COP', 4.60, 4.90],
      ['COP', 'USD', 0.000230, 0.000240],
      ['COP', 'EUR', 0.000210, 0.000220]
    ];

    const insertTasa = db.prepare(`
      INSERT INTO tasas_cambio (divisa_origen, divisa_destino, tasa_compra, tasa_venta, actualizado_por)
      VALUES (?, ?, ?, ?, 1)
    `);
    tasas.forEach(t => insertTasa.run(...t));

    // Insertar oficinas (Barranquilla, Colombia)
    const oficinas = [
      ['Sucursal Riomar', 'Cl. 93 #46-90 Local 2, Riomar, Barranquilla, Atlántico, Colombia', '+57 605 123 4567', 'Lun-Vie: 8:00-18:00, Sáb: 9:00-13:00', 11.0041, -74.8141],
      ['Aeropuerto Ernesto Cortissoz', 'Aeropuerto Internacional Ernesto Cortissoz, Soledad, Atlántico, Colombia', '+57 605 234 5678', 'Lun-Dom: 5:00-22:00', 10.8896, -74.7808]
    ];

    const insertOficina = db.prepare(`
      INSERT INTO oficinas (nombre, direccion, telefono, horario, latitud, longitud)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    oficinas.forEach(o => insertOficina.run(...o));
  }
}

module.exports = { getDb, initializeDatabase, initDatabase };
