const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('tienda.db');

// Ejecutar esquema si no existe
const schema = fs.readFileSync('./schema.sql', 'utf8');
db.exec(schema);

module.exports = db;
