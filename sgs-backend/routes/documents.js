const express = require('express');
const pool = require('../db');

const resultatsRouter = express.Router();
const certificatsRouter = express.Router();

resultatsRouter.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const niveau = req.query.niveau || '';
    const trimestre = req.query.trimestre || '';

    const conditions = [];
    const params = [];
    let idx = 1;

    if (niveau) { conditions.push(`niveau = $${idx}`); params.push(niveau); idx++; }
    if (trimestre) { conditions.push(`trimestre = $${idx}`); params.push(parseInt(trimestre)); idx++; }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const countResult = await pool.query(`SELECT COUNT(*)::int AS count FROM resultats ${whereClause}`, params);
    const total = countResult.rows[0].count;

    const result = await pool.query(
      `SELECT * FROM resultats ${whereClause} ORDER BY id DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    res.json({ data: result.rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

resultatsRouter.post('/upload', async (req, res) => {
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
          row.informatique, row.eps, row.musique, row.art, row.moyenne_generale,
        ]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

certificatsRouter.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM certificats');
    const total = countResult.rows[0].count;

    const result = await pool.query(
      'SELECT * FROM certificats ORDER BY date_emission DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({ data: result.rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.json({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  }
});

certificatsRouter.post('/generate', async (req, res) => {
  const { eleve_id, id_massar, nom, prenom } = req.body;
  try {
    let dbId = eleve_id;

    if (typeof eleve_id === 'string' && eleve_id.startsWith('r_')) {
      const check = await pool.query('SELECT id FROM eleves WHERE id_massar = $1', [id_massar]);
      if (check.rows.length > 0) {
        dbId = check.rows[0].id;
      } else if (id_massar) {
        const insert = await pool.query(
          `INSERT INTO eleves (id_massar, nom, prenom, classe, niveau, date_naissance, absences, absences_justifiees)
           VALUES ($1, $2, $3, $4, $5, $6, 0, 0) RETURNING id`,
          [id_massar, nom || '', prenom || '', null, null, null]
        );
        dbId = insert.rows[0].id;
      } else {
        return res.status(400).json({ error: 'Impossible de générer le certificat' });
      }
    }

    await pool.query(
      'INSERT INTO certificats (eleve_id, statut, date_emission, numero) VALUES ($1, $2, CURRENT_DATE, $3)',
      [dbId, 'généré', `CERT-${String(Math.random()).slice(2, 8)}`]
    );
    res.json({ success: true, eleve_id: dbId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { resultatsRouter, certificatsRouter };
