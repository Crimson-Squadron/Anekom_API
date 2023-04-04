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

const pool = mysql.createPool({
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

// GET all anekdot from the database
app.get('/anekdot', (req, res) => {
  const sql = 'SELECT * FROM anekdot';
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

// Update the favorite column of a specific anekdot in the database
app.put('/anekdot/:id', (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE anekdot SET favorite=NOT favorite WHERE id=${id}`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(`Anekdot text with ID ${id} has been toggled`);
  });
});

// GET all favorite from the database
app.get('/favorite', (req, res) => {
  const sql = 'SELECT * FROM anekdot WHERE favorite=1';
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

// get route to retrieve the note
app.get('/catatan', (req, res) => {
  pool.query('SELECT * FROM catatan WHERE id=1', (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send(error);
    } else {
      res.send(results);
    }
  });
});

// put route to update the note
app.put('/catatan/1', (req, res) => {
  const { id } = req.params;
  const { isi_catatan } = req.body;
  pool.query('UPDATE catatan SET isi_catatan = ? WHERE id = 1', [isi_catatan, id], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send(error);
    } else if (results.affectedRows === 0) {
      res.status(404).send('Note not found');
    } else {
      res.send('Note updated successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});