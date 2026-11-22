/**
 * Baamboozle English Game - Backend API Server
 * Lightweight Node.js + Express + pg connector
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// PostgreSQL Pool Connection
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'english_game',
  connectionTimeoutMillis: 3000,
});

// Auto-initialize schema if tables do not exist
async function ensureDatabaseSchema() {
  try {
    const check = await pool.query("SELECT to_regclass('public.users') as exists");
    if (!check.rows[0].exists) {
      console.log('⚡ Table "users" not found: initializing database from schema.sql...');
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(sql);
        console.log('✅ PostgreSQL database initialized automatically with schema and seed data!');
      }
    } else {
      // Ensure level column exists in themes table
      await pool.query("ALTER TABLE themes ADD COLUMN IF NOT EXISTS level VARCHAR(10) DEFAULT 'A1'");
    }
  } catch (err) {
    console.warn('⚠️  Auto-migration check note:', err.message);
  }
}

// Test connection on launch
pool.connect()
  .then(async (client) => {
    console.log('✅ Connected to PostgreSQL database successfully!');
    client.release();
    await ensureDatabaseSchema();
  })
  .catch((err) => {
    console.warn('⚠️  PostgreSQL connection warning:', err.message);
    console.warn('👉 Please ensure PostgreSQL is running and credentials match in .env / schema.sql');
  });

// -------------------------------------------------------------
// 1. HEALTH & STATUS ENDPOINT
// -------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, COUNT(*)::int as theme_count FROM themes');
    return res.json({
      status: 'connected',
      database: process.env.PGDATABASE || 'english_game',
      time: result.rows[0].current_time,
      themesAvailable: result.rows[0].theme_count
    });
  } catch (err) {
    return res.status(503).json({
      status: 'disconnected',
      error: err.message,
      hint: 'Make sure your PostgreSQL database exists and schema.sql has been executed.'
    });
  }
});

// -------------------------------------------------------------
// 2. AUTHENTICATION (Register & Login)
// -------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // Check if user or email already exists
    const checkUser = await pool.query(
      'SELECT id, username, email FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)',
      [username.trim(), email.trim()]
    );

    if (checkUser.rows.length > 0) {
      const match = checkUser.rows[0];
      if (match.username.toLowerCase() === username.trim().toLowerCase()) {
        return res.status(409).json({ error: 'Username is already taken.' });
      }
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const insertResult = await pool.query(
      `INSERT INTO users (username, email, password_hash, total_score)
       VALUES ($1, $2, $3, 0)
       RETURNING id, username, email, total_score, created_at`,
      [username.trim(), email.trim(), passwordHash]
    );

    const newUser = insertResult.rows[0];
    return res.status(201).json({
      message: 'Account created successfully!',
      user: newUser
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Please provide email/username and password.' });
  }

  try {
    const userQuery = await pool.query(
      `SELECT id, username, email, password_hash, total_score, created_at
       FROM users
       WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)`,
      [login.trim()]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this username or email.' });
    }

    const user = userQuery.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password. Emotional damage!' });
    }

    delete user.password_hash;
    return res.json({
      message: 'Login successful!',
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
});

// -------------------------------------------------------------
// 3. THEMES & EXERCISES ENDPOINTS
// -------------------------------------------------------------
app.get('/api/themes', async (req, res) => {
  const levelFilter = req.query.level ? req.query.level.toUpperCase() : null;
  try {
    const query = `
      SELECT t.id, t.title, t.description, t.color_theme, t.icon, t.level, t.lesson_title, t.lesson_content,
             COUNT(e.id)::int AS exercise_count
      FROM themes t
      LEFT JOIN exercises e ON e.theme_id = t.id
      WHERE ($1::text IS NULL OR $1::text = 'ALL' OR UPPER(t.level) = $1::text)
      GROUP BY t.id
      ORDER BY t.id ASC
    `;
    const result = await pool.query(query, [levelFilter]);
    return res.json(result.rows);
  } catch (err) {
    console.error('Error fetching themes:', err);
    return res.status(500).json({ error: 'Could not fetch themes: ' + err.message });
  }
});

app.get('/api/themes/:id/exercises', async (req, res) => {
  const themeId = parseInt(req.params.id, 10);
  if (isNaN(themeId)) {
    return res.status(400).json({ error: 'Invalid theme ID.' });
  }

  try {
    const themeRes = await pool.query('SELECT * FROM themes WHERE id = $1', [themeId]);
    if (themeRes.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found.' });
    }

    const exercisesRes = await pool.query(
      `SELECT id, theme_id, question_type, question_text, options_json, correct_answer, close_answers_json
       FROM exercises
       WHERE theme_id = $1
       ORDER BY id ASC`,
      [themeId]
    );

    return res.json({
      theme: themeRes.rows[0],
      exercises: exercisesRes.rows
    });
  } catch (err) {
    console.error('Error fetching exercises:', err);
    return res.status(500).json({ error: 'Could not fetch exercises: ' + err.message });
  }
});

// -------------------------------------------------------------
// 4. SCORES & LEADERBOARD
// -------------------------------------------------------------
app.post('/api/scores', async (req, res) => {
  const { userId, themeId, score } = req.body;

  if (themeId === undefined || score === undefined) {
    return res.status(400).json({ error: 'Theme ID and score are required.' });
  }

  try {
    // Insert into scores table
    const scoreInsert = await pool.query(
      `INSERT INTO scores (user_id, theme_id, score)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, theme_id, score, played_at`,
      [userId || null, themeId, score]
    );

    // If registered user, increment total_score
    let updatedTotalScore = null;
    if (userId) {
      const userUpdate = await pool.query(
        `UPDATE users
         SET total_score = total_score + $1
         WHERE id = $2
         RETURNING total_score`,
        [score, userId]
      );
      if (userUpdate.rows.length > 0) {
        updatedTotalScore = userUpdate.rows[0].total_score;
      }
    }

    return res.status(201).json({
      message: 'Score saved successfully!',
      scoreRecord: scoreInsert.rows[0],
      updatedTotalScore
    });
  } catch (err) {
    console.error('Error saving score:', err);
    return res.status(500).json({ error: 'Could not save score: ' + err.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, total_score, created_at
       FROM users
       ORDER BY total_score DESC, id ASC
       LIMIT 10`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return res.status(500).json({ error: 'Could not fetch leaderboard: ' + err.message });
  }
});

// -------------------------------------------------------------
// 5. STICKERS & VIDEOS DISCOVERY ENDPOINT
// Scans /assets/stickers/ for any media (PNG, JPG, GIF, WEBP, MP4, WEBM)
// -------------------------------------------------------------
app.get('/api/stickers', (req, res) => {
  const baseDir = path.join(__dirname, 'assets', 'stickers');
  const categories = ['correct', 'close', 'wrong'];
  const result = {
    correct: [],
    close: [],
    wrong: []
  };

  categories.forEach((cat) => {
    const catDir = path.join(baseDir, cat);
    if (fs.existsSync(catDir)) {
      const files = fs.readdirSync(catDir);
      result[cat] = files
        .filter(f => /\.(png|jpe?g|gif|webp|mp4|webm)$/i.test(f) && !f.endsWith('.svg'))
        .map(f => `/assets/stickers/${cat}/${f}`);
    }
  });

  return res.json(result);
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Baamboozle English Game Server running on port ${PORT}`);
  console.log(`👉 Open http://localhost:${PORT} in your browser!`);
  console.log(`=======================================================`);
});
