const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret'; // In production, use env variable
const REFRESH_SECRET = 'your_refresh_secret'; // Different secret for refresh tokens

// Connect to database
const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'mydb',
  password: 'mypassword',
  port: 5432,
});

// Email transporter (dummy for demo)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_password'
  }
});

// Middleware to parse JSON
app.use(express.json());

// JWT auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Signup
app.post('/signup', async (req, res) => {
  console.log('Signup request body:', req.body);
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    console.error('Signup validation failed:', { name, email, password });
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );
    console.log('Signup success:', { id: result.rows[0].id, email });
    res.status(201).json({ id: result.rows[0].id, message: 'User created' });
  } catch (err) {
    console.error('Signup error:', err.stack || err.message || err, { body: req.body });
    if (err.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_SECRET, { expiresIn: '7d' });

    // Store refresh token in DB
    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Refresh token
app.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1 AND refresh_token = $2', [decoded.id, refreshToken]);
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const user = result.rows[0];
    const newAccessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_SECRET, { expiresIn: '7d' });

    // Update refresh token in DB
    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Forgot password
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_expires = NOW() + INTERVAL \'1 hour\' WHERE email = $2',
      [resetToken, email]
    );

    // Send email (dummy)
    const mailOptions = {
      from: 'your_email@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Reset your password: http://localhost:3000/reset-password?token=${resetToken}`
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Email error:', err);
        res.status(500).json({ error: 'Failed to send email' });
      } else {
        res.json({ message: 'Reset email sent' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend email (for verification or reset)
app.post('/resend-email', async (req, res) => {
  const { email, type } = req.body; // type: 'reset' or 'verify'
  // Similar to forgot password, implement as needed
  res.json({ message: 'Email resent' });
});

// Edit profile (protected)
app.put('/profile', authenticateToken, async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3',
      [name, email, userId]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get profile (protected)
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy routes
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
