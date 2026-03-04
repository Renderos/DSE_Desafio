const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const db = new sqlite3.Database("./database.db");

// Crear tablas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      email TEXT,
      telefono TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS solicitudes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      descripcion TEXT,
      estado TEXT DEFAULT 'Pendiente',
      FOREIGN KEY(cliente_id) REFERENCES clientes(id)
    )
  `);
});

// Registrar cliente
app.post("/clientes", (req, res) => {
  const { nombre, email, telefono } = req.body;
  db.run(
    "INSERT INTO clientes (nombre, email, telefono) VALUES (?, ?, ?)",
    [nombre, email, telefono],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

// Registrar solicitud
app.post("/solicitudes", (req, res) => {
  const { cliente_id, descripcion } = req.body;
  db.run(
    "INSERT INTO solicitudes (cliente_id, descripcion) VALUES (?, ?)",
    [cliente_id, descripcion],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

// Consultar estado
app.get("/solicitudes/:id", (req, res) => {
  db.get(
    "SELECT * FROM solicitudes WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json(err);
      res.json(row);
    }
  );
});

app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));