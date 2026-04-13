const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const app = express();
const port = process.env.PORT || 3000;

// Connect to database
const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'mydb',
  password: 'mypassword',
  port: 5432,
});

// Middleware to parse JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Signup
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );
    res.status(201).json({ id: result.rows[0].id, message: 'User created' });
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
