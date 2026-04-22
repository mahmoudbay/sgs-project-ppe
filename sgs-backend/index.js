const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Allows your React app on 5173 to talk to this server
app.use(express.json());

// ═══════════════════════════════════════════════════════
//  DATABASE CONNECTION
// ═══════════════════════════════════════════════════════
const pool = new Pool({
  user: 'sgs_admin',
  host: 'localhost',
  database: 'sgs_db',
  password: 'sgs_pass_2026',
  port: 5432,
});

// ═══════════════════════════════════════════════════════
//  AUTHENTICATION ROUTES
// ═══════════════════════════════════════════════════════

// LOGIN Route (Matched to React: /api/auth/login)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' }); // 'message' matches React's error handling
    }
    
    const user = result.rows[0];
    
    if (password !== user.password) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }
    
    // React expects a token and user object
    res.json({
      token: 'mock-jwt-token-sgs-2026', // A mock token to satisfy the frontend login logic
      user: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// VERIFY Route (Prevents logout on page refresh)
app.get('/api/auth/verify', (req, res) => {
  res.json({ valid: true });
});

// SIGNUP Route
app.post('/api/auth/signup', async (req, res) => {
  const { nom, prenom, email, password, role } = req.body;
  try {
    if (!nom || !email || !password) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    const initiales = (prenom ? prenom[0].toUpperCase() : '') + (nom ? nom[0].toUpperCase() : '');
    const userRole = role || 'employe';

    const result = await pool.query(
      `INSERT INTO users (nom, prenom, email, password, role, initiales, actif) 
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
      [nom, prenom, email, password, userRole, initiales]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Cet email existe déjà' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ═══════════════════════════════════════════════════════
//  DASHBOARD & NOTIFICATIONS
// ═══════════════════════════════════════════════════════

// Dashboard Stats Route
// Dashboard Stats Route
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // 1. Fetch the 3 most recent RH requests and get the employee's full name
    const recentReqs = await pool.query(`
      SELECT d.id, d.type, d.statut, u.prenom || ' ' || u.nom AS "employeeName"
      FROM demandes_rh d
      LEFT JOIN users u ON d.employe_id = u.id
      ORDER BY d.id DESC 
      LIMIT 3
    `);

    // 2. Return the data to React
    res.json({
      activeUsers: 24,        // You can replace these with real COUNT() queries later!
      usersTrend: 12,
      monthlyRevenue: 45000,
      revenueTrend: 5,
      totalStudents: 312,
      certificatesGenerated: 89,
      certificateTrend: 15,
      recentRequests: recentReqs.rows // <--- THIS IS THE FIX: Sending real DB data
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err.message);
    // Send an empty array if the table doesn't exist yet so React doesn't crash
    res.json({ recentRequests: [] }); 
  }
});

// Get user notifications
// ═══════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════════════

// Fetch user notifications
app.get('/api/notifications/user/:id', async (req, res) => {
  try { 
    // Fetch notifications ONLY for the logged-in user
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY temps DESC LIMIT 10',
      [req.params.id]
    ); 
    res.json(result.rows); 
  } catch (err) { 
    res.json([]); 
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET lu = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
//  RH VALIDATION (WITH AUTO-NOTIFICATIONS)
// ═══════════════════════════════════════════════════════

// Admin updates a request -> Triggers a notification!
app.put('/api/demandes-rh/:id', async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;
  try {
    // 1. Update the request status
    await pool.query('UPDATE demandes_rh SET statut = $1 WHERE id = $2', [statut, id]);
    
    // 2. Find out WHO made this request and WHAT it was
    const reqResult = await pool.query('SELECT employe_id, type FROM demandes_rh WHERE id = $1', [id]);
    
    if (reqResult.rows.length > 0) {
      const employe_id = reqResult.rows[0].employe_id;
      const reqType = reqResult.rows[0].type.replace("_", " ");

      // 3. Create the notification for that specific employee
      const message = `Votre demande de ${reqType} a été ${statut}.`;
      await pool.query(
        'INSERT INTO notifications (user_id, type, message, temps, lu) VALUES ($1, $2, $3, NOW(), false)',
        [employe_id, 'Mise à jour RH', message]
      );
    }

    res.json({ success: true });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// ═══════════════════════════════════════════════════════
//  API ROUTES (Data)
// ═══════════════════════════════════════════════════════

app.get('/api/eleves', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM eleves ORDER BY nom ASC');
    res.json(result.rows);
  } catch (err) {
    res.json([]); // Prevents crash if table empty
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// RH Routes (Renamed to match React's /demandes-rh)
app.get('/api/demandes-rh', async (req, res) => {
  try { 
    const result = await pool.query('SELECT * FROM demandes_rh'); 
    res.json(result.rows); 
  } catch (err) { 
    res.json([]); 
  }
});

app.post('/api/demandes-rh', async (req, res) => {
  const { type, date_debut, date_fin, motif, employe_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO demandes_rh (type, date_debut, date_fin, motif, employe_id, statut) VALUES ($1, $2, $3, $4, $5, $6)',
      [type, date_debut, date_fin, motif, employe_id, 'en attente']
    );
    res.json({ success: true });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.put('/api/demandes-rh/:id', async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;
  try {
    await pool.query('UPDATE demandes_rh SET statut = $1 WHERE id = $2', [statut, id]);
    res.json({ success: true });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// Finance Routes
app.get('/api/operations', async (req, res) => {
  try { 
    const result = await pool.query('SELECT * FROM operations'); 
    res.json(result.rows); 
  } catch (err) { 
    res.json([]); 
  }
});

app.post('/api/operations', async (req, res) => {
  const { type, categorie, description, montant, date, saisie_par } = req.body;
  try {
    await pool.query(
      'INSERT INTO operations (type, categorie, description, montant, date, saisie_par, statut) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [type, categorie, description, montant, date, saisie_par, 'validé']
    );
    res.json({ success: true });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// Documents Routes
// POST: Upload Excel Results
app.post('/api/resultats/upload', async (req, res) => {
  const { resultats } = req.body;
  try {
    for (const row of resultats) {
      await pool.query(
        `INSERT INTO resultats (
          massar_id, eleve_name, niveau, trimestre, maths, physique, svt, 
          francais, arabe, anglais, histoire_geo, education_islamique, 
          informatique, eps, musique, art, moyenne_generale
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          row.massar_id, row.eleve_name, row.niveau, row.trimestre, row.maths, row.physique, row.svt,
          row.francais, row.arabe, row.anglais, row.histoire_geo, row.education_islamique,
          row.informatique, row.eps, row.musique, row.art, row.moyenne_generale
        ]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch all results
app.get('/api/resultats', async (req, res) => {
  try {
    // This query pulls everything from the table we created in DBeaver
    const result = await pool.query('SELECT * FROM resultats ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST: Upload results (Make sure this matches exactly)
app.post('/api/resultats/upload', async (req, res) => {
  const { resultats } = req.body;
  try {
    for (const row of resultats) {
      await pool.query(
        `INSERT INTO resultats (
          massar_id, eleve_name, niveau, trimestre, maths, physique, svt, 
          francais, arabe, anglais, histoire_geo, education_islamique, 
          informatique, eps, musique, art, moyenne_generale
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          row.massar_id, row.eleve_name, row.niveau, row.trimestre, row.maths, row.physique, row.svt,
          row.francais, row.arabe, row.anglais, row.histoire_geo, row.education_islamique,
          row.informatique, row.eps, row.musique, row.art, row.moyenne_generale
        ]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Upload DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// certificats routes :

app.get('/api/certificats', async (req, res) => {
  try { 
    const result = await pool.query('SELECT * FROM certificats ORDER BY date_emission DESC'); 
    res.json(result.rows); 
  } catch (err) { 
    res.json([]); 
  }
});

app.post('/api/certificats/generate', async (req, res) => {
  const { eleve_id } = req.body;
  try {
    // Simple logic to mock generating a certificate
    await pool.query(
      'INSERT INTO certificats (eleve_id, statut, date_emission, numero) VALUES ($1, $2, CURRENT_DATE, $3)',
      [eleve_id, 'généré', `CERT-${Math.floor(Math.random() * 10000)}`]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
//  SERVER START
// ═══════════════════════════════════════════════════════
app.listen(port, () => {
  console.log(`🚀 SGS Backend Bridge running on http://localhost:${port}`);
});
