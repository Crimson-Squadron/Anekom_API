const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// Middleware
app.use(bodyParser.json());

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

// Register user endpoint
app.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  // Insert user into database
  db.query('INSERT INTO pengguna (username, password, email) VALUES (?, ?, ?)', [username, hash, email], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error registering user');
    } else {
      res.status(200).send('User registered successfully');
    }
  });
});

// Login user endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if user exists in database
  db.query('SELECT * FROM pengguna WHERE username = ?', [username], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error authenticating user');
    } else if (result.length == 0) {
      res.status(401).send('Invalid username or password');
    } else {
      const hash = result[0].password;

      // Check if password is correct
      if (bcrypt.compareSync(password, hash)) {
        const token = jwt.sign({ id: result[0].id }, 'yoursecretkey', { expiresIn: '1h' });
        res.status(200).send({ auth: true, token: token });
      } else {
        res.status(401).send('Invalid username or password');
      }
    }
  });
});

// Verify token endpoint
app.get('/verify', (req, res) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    res.status(401).send({ auth: false, message: 'No token provided' });
  } else {
    jwt.verify(token, 'yoursecretkey', (err, decoded) => {
      if (err) {
        res.status(500).send({ auth: false, message: 'Failed to authenticate token' });
      } else {
        res.status(200).send({ auth: true, message: 'Token authenticated', data: decoded });
      }
    });
  }
});

// Sample quiz data
const questions = [
  {
    id: 1,
    question: "1. Manakah ciri-ciri teks anekdot, yaitu:",
    options: ["a. Berisi kritikan", "b. Menggunakan konjungsi temporal", "c. Memakai kata kerja material", "d. Memiliki koda"],
    answer: "a. Berisi kritikan"
  },
  {
    id: 2,
    question: "2. Teks anekdot merupakan teks yang, bersifat:",
    options: ["a. Membosankan", "b. Lucu dan menarik", "c. Mengajak melakukan sesuatu", "d. Memberi langkah-langkah membuat sesuatu"],
    answer: "b. Lucu dan menarik"
  },
  {
    id: 3,
    question: "3. Manakan dibawah ini yang merupakan struktur teks anekdot?",
    options: ["a. Koda, keterangan waktu, krisis, kritikan", "b. Abstraksi, koda, reaksi, orientasi, konjungsi", "c. Koda, orientasi, krisis, reaksi, abstraksi", "d. Material, orientasi, kritikan, alur maju"],
    answer: "c. Koda, orientasi, krisis, reaksi, abstraksi"
  },
  {
    id: 4,
    question: "4. Bagian yang tidak boleh dihilangkan dari cerita teks anekdot adalah?",
    options: ["a. Kelucuan dan nilai didiknya", "b. Pelaku dan alurnya", "c. Panjang cerita dan bagusnya", "d. Gaya bercerita"],
    answer: "a. Kelucuan dan nilai didiknya"
  },
  {
    id: 5,
    question: "5. Fungsi dibuatnya teks anekdot adalah?",
    options: ["a. Menceritakan kisah masa lalu", "b. Mendeskripsikan sesuatu", "c. Teks untuk memasarkan suatu barang", " d. Memberikan kritik dan saran dalam bentuk lelucon"],
    answer: "d. Memberikan kritik dan saran dalam bentuk lelucon"
  },
  {
    id: 6,
    question: "6. Bagian dalam teks anekdot yang berisi pesan disebut?",
    options: ["a. Reaksi", "b. Koda", "c. Konjungsi", "d. Pesan singkat"],
    answer: "b. Koda"
  },
  {
    id: 7,
    question: "7. Bersifat lucu dan membangkitkan tawa tetapi mengandung sebuah kritikan adalah .... teks anekdot.",
    options: ["a. Struktur", "b. Ciri-ciri", "c. Ciri Kebahasaan", "d. Pengertian"],
    answer: "b. Ciri-ciri"
  },
  {
    id: 8,
    question: "8. Apa itu konjungsi temporal?",
    options: ["a. kata penghubung yang berkaitan dengan waktu.", "b. Kata kerja yang berhubungan dengan tempat.", "c. kata penghubung yang berkaitan dengan sebab-akibat.", "d. kata kerja yang berkaitan dengan waktu."],
    answer: "a. kata penghubung yang berkaitan dengan waktu."
  },
  {
    id: 9,
    question: "9. Tanggapan tokoh dalam menghadapi krisis dalam teks anekdot disebut?",
    options: ["a. Koda", "b. Resolusi", "c. Abstaksi", "d. Reaksi"],
    answer: "d. Reaksi"
  },
  {
    id: 10,
    question: "10. Pengertian dari teks anekdot adalah?",
    options: ["a. Teks yang mendeskripsikan sesuatu", "b. Teks yang berisi sindiran yang dikemas dalam bentuk lelucon", "c. Teks yang berisi langkah-langkah melakukan sesuatu", "d. Teks yang berisi cerita rakyat"],
    answer: "b. Teks yang berisi sindiran yang dikemas dalam bentuk lelucon"
  },
];

app.post('/result', (req, res) => {
  const answers = req.body.answers; // array of user's answers
  let score = 0;
  let correctAnswers = 0;
  
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].answer) {
      score += 1; // add 10 points for each correct answer
      correctAnswers++;
    }
  }

  const result = {
    score: score,
    correctAnswers: correctAnswers,
    totalQuestions: questions.length
  };

  res.json(result);
});

app.get('/quiz', (req, res) => {
  res.json(questions);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});