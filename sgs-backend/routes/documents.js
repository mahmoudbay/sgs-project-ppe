const express = require('express');
const pool = require('../db');
const { authenticate, requirePermission } = require('../middlewares/auth');

const resultatsRouter = express.Router();
const certificatsRouter = express.Router();

resultatsRouter.use(authenticate);

resultatsRouter.get('/', requirePermission('grades:read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const niveau = req.query.niveau || '';
    const classe = req.query.classe || '';
    const semestre = req.query.semestre || '';

    const conditions = [];
    const params = [];
    let idx = 1;

    if (niveau) { conditions.push(`r.niveau = $${idx}`); params.push(niveau); idx++; }
    if (classe) { conditions.push(`r.classe = $${idx}`); params.push(classe); idx++; }
    if (semestre) { conditions.push(`r.semestre = $${idx}`); params.push(parseInt(semestre)); idx++; }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS count FROM resultats r ${whereClause}`, params
    );
    const total = countResult.rows[0].count;

    const result = await pool.query(
      `SELECT r.*, e.nom, e.prenom, e.classe AS eleve_classe
       FROM resultats r
       LEFT JOIN eleves e ON e.id = r.eleve_id
       ${whereClause}
       ORDER BY r.id DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    res.json({ data: result.rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

resultatsRouter.get('/by-classe', requirePermission('grades:read'), async (req, res) => {
  try {
    const { niveau, classe, semestre } = req.query;

    const eleves = await pool.query(
      `SELECT id, id_massar, nom, prenom, classe, niveau FROM eleves
       WHERE niveau = $1 AND classe = $2 ORDER BY nom ASC`,
      [niveau, classe]
    );

    const notes = await pool.query(
      `SELECT * FROM resultats
       WHERE niveau = $1 AND classe = $2 AND semestre = $3`,
      [niveau, classe, parseInt(semestre)]
    );

    const notesByEleve = {};
    for (const n of notes.rows) {
      notesByEleve[n.eleve_id] = n;
    }

    const merged = eleves.rows.map(e => ({
      eleve: e,
      notes: notesByEleve[e.id] || null,
      hasNotes: !!notesByEleve[e.id],
    }));

    res.json({ data: merged, total: merged.length });
  } catch (err) {
    console.error("Fetch by-classe Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

resultatsRouter.post('/upload', requirePermission('grades:manage'), async (req, res) => {
  const { resultats } = req.body;
  try {
    for (const row of resultats) {
      let eleveId = null;
      if (row.massar_id) {
        const found = await pool.query('SELECT id FROM eleves WHERE id_massar = $1', [row.massar_id]);
        if (found.rows.length > 0) eleveId = found.rows[0].id;
      }

      await pool.query(
        `INSERT INTO resultats (
          massar_id, eleve_name, eleve_id, niveau, classe, semestre,
          maths, physique, svt, francais, arabe, anglais,
          histoire_geo, education_islamique, informatique, eps, musique, art,
          moyenne_generale
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          row.massar_id, row.eleve_name, eleveId, row.niveau, row.classe, row.semestre,
          row.maths, row.physique, row.svt, row.francais, row.arabe, row.anglais,
          row.histoire_geo, row.education_islamique, row.informatique, row.eps, row.musique, row.art,
          row.moyenne_generale,
        ]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

resultatsRouter.post('/', requirePermission('grades:manage'), async (req, res) => {
  const {
    massar_id, eleve_name, niveau, classe, semestre,
    maths, physique, svt, francais, arabe, anglais,
    histoire_geo, education_islamique, informatique, eps, musique, art,
    moyenne_generale
  } = req.body;
  try {
    let eleveId = null;
    if (massar_id) {
      const found = await pool.query('SELECT id FROM eleves WHERE id_massar = $1', [massar_id]);
      if (found.rows.length > 0) eleveId = found.rows[0].id;
    }

    const result = await pool.query(
      `INSERT INTO resultats (
        massar_id, eleve_name, eleve_id, niveau, classe, semestre,
        maths, physique, svt, francais, arabe, anglais,
        histoire_geo, education_islamique, informatique, eps, musique, art,
        moyenne_generale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [massar_id, eleve_name, eleveId, niveau, classe, semestre,
        maths, physique, svt, francais, arabe, anglais,
        histoire_geo, education_islamique, informatique, eps, musique, art,
        moyenne_generale]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

resultatsRouter.put('/:id', requirePermission('grades:manage'), async (req, res) => {
  const { id } = req.params;
  const {
    massar_id, eleve_name, niveau, classe, semestre,
    maths, physique, svt, francais, arabe, anglais,
    histoire_geo, education_islamique, informatique, eps, musique, art,
    moyenne_generale
  } = req.body;
  try {
    let eleveId = null;
    if (massar_id) {
      const found = await pool.query('SELECT id FROM eleves WHERE id_massar = $1', [massar_id]);
      if (found.rows.length > 0) eleveId = found.rows[0].id;
    }

    const result = await pool.query(
      `UPDATE resultats SET
        massar_id = $1, eleve_name = $2, eleve_id = $3, niveau = $4, classe = $5, semestre = $6,
        maths = $7, physique = $8, svt = $9, francais = $10, arabe = $11,
        anglais = $12, histoire_geo = $13, education_islamique = $14,
        informatique = $15, eps = $16, musique = $17, art = $18,
        moyenne_generale = $19
      WHERE id = $20 RETURNING *`,
      [massar_id, eleve_name, eleveId, niveau, classe, semestre,
        maths, physique, svt, francais, arabe, anglais,
        histoire_geo, education_islamique, informatique, eps, musique, art,
        moyenne_generale, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Résultat non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

resultatsRouter.delete('/:id', requirePermission('grades:manage'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM resultats WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Résultat non trouvé' });
    }
    res.json({ success: true, id: parseInt(id) });
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
