const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'clinica_san_gabriel'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a MySQL');
});

// --- RUTA PARA OBTENER PACIENTES (GET) ---
app.get('/api/pacientes', (req, res) => {
    db.query("SELECT * FROM pacientes", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// --- RUTA PARA GUARDAR PACIENTES (POST) ---
app.post('/api/pacientes', (req, res) => {
    const { cedula, nombres, apellidos, email, grupo_sanguineo } = req.body;
    const sql = "INSERT INTO pacientes (cedula, nombres, apellidos, email, grupo_sanguineo) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [cedula, nombres, apellidos, email, grupo_sanguineo], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: err });
        }
        res.json({ success: true, id: result.insertId });
    });
});

// --- RUTA DE LOGIN ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM usuarios WHERE username = ? AND password = ?", [username, password], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length > 0) {
            res.json({ success: true, user: { username: result[0].username, rol: result[0].rol } });
        } else {
            res.status(401).json({ success: false });
        }
    });
});

app.listen(3000, () => console.log('Servidor activo en el puerto 3000'));