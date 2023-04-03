const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'anekom_db'
});

db.connect((err) => {
  if (err) {
    console.log('Error connecting to database');
    return;
  }
  console.log('Connected to database');
});

// Use body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GET all materi from the database
app.get('/materi', (req, res) => {
  const sql = 'SELECT * FROM materi';
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

// GET a specific materi from the database
app.get('/materi/:id', (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM materi WHERE id=${id}`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

// Update the favorite column of a specific materi in the database
app.put('/materi/:id', (req, res) => {
  const id = req.params.id;
  const favorite = req.body.favorite;
  const sql = `UPDATE materi SET favorite=${favorite} WHERE id=${id}`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(`Materi with ID ${id} has been favorited`);
  });
});

app.get('/favorite', (req, res) => {
  const sql = 'SELECT * FROM materi WHERE favorite=1';
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});