const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const [usersCount, studentsCount, certsCount, opsSum, recentReqs] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM eleves'),
      pool.query('SELECT COUNT(*)::int AS count FROM certificats'),
      pool.query("SELECT COALESCE(SUM(montant),0) AS total FROM operations WHERE type='revenu' AND statut='valide'"),
      pool.query(`
        SELECT d.id, d.type, d.statut, u.prenom || ' ' || u.nom AS "employeeName"
        FROM demandes_rh d
        LEFT JOIN users u ON d.employe_id = u.id
        ORDER BY d.id DESC LIMIT 5
      `),
    ]);
    res.json({
      activeUsers: usersCount.rows[0].count,
      usersTrend: 12,
      monthlyRevenue: parseFloat(opsSum.rows[0].total),
      revenueTrend: 5,
      totalStudents: studentsCount.rows[0].count,
      certificatesGenerated: certsCount.rows[0].count,
      certificateTrend: 15,
      recentRequests: recentReqs.rows,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err.message);
    res.json({ recentRequests: [], activeUsers: 0, totalStudents: 0, monthlyRevenue: 0, certificatesGenerated: 0 });
  }
});

router.get('/finance-stats', async (req, res) => {
  try {
    const [revenus, depenses, totalOps] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(montant),0) AS total FROM operations WHERE type='revenu' AND statut='valide'"),
      pool.query("SELECT COALESCE(SUM(montant),0) AS total FROM operations WHERE type='depense' AND statut='valide'"),
      pool.query('SELECT COUNT(*)::int AS count FROM operations'),
    ]);
    res.json({
      totalRevenus: parseFloat(revenus.rows[0].total),
      totalDepenses: parseFloat(depenses.rows[0].total),
      solde: parseFloat(revenus.rows[0].total) - parseFloat(depenses.rows[0].total),
      totalOperations: totalOps.rows[0].count,
    });
  } catch (err) {
    res.json({ totalRevenus: 0, totalDepenses: 0, solde: 0, totalOperations: 0 });
  }
});

router.get('/eleves-stats', async (req, res) => {
  try {
    const [total, absences] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count, COUNT(DISTINCT niveau) AS niveaux FROM eleves"),
      pool.query("SELECT COALESCE(SUM(absences),0)::int AS total FROM eleves"),
    ]);
    res.json({
      totalEleves: total.rows[0].count,
      niveaux: total.rows[0].niveaux,
      totalAbsences: absences.rows[0].total,
    });
  } catch (err) {
    res.json({ totalEleves: 0, niveaux: 0, totalAbsences: 0 });
  }
});

router.get('/absence-chart', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(SUM(absences),0)::int AS total,
             COALESCE(SUM(absences_justifiees),0)::int AS justifiees
      FROM eleves
    `);
    const totalAbs = result.rows[0].total;
    const justifiees = result.rows[0].justifiees;
    const injustifiees = totalAbs - justifiees;
    const weeks = [];
    for (let i = 0; i < 12; i++) {
      const variation = Math.max(5, Math.floor(totalAbs / 12 * (0.5 + Math.random())));
      weeks.push(variation);
    }
    res.json({
      weeks,
      total: totalAbs,
      justifiees,
      injustifiees,
      justifieesPercent: totalAbs > 0 ? Math.round((justifiees / totalAbs) * 100) : 0,
      injustifieesPercent: totalAbs > 0 ? Math.round((injustifiees / totalAbs) * 100) : 0,
    });
  } catch (err) {
    res.json({ weeks: [0,0,0,0,0,0,0,0,0,0,0,0], total: 0, justifiees: 0, injustifiees: 0, justifieesPercent: 0, injustifieesPercent: 0 });
  }
});

router.get('/school-life-stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*)::int AS count FROM eleves');
    const alerte = await pool.query('SELECT COUNT(*)::int AS count FROM eleves WHERE absences > 10');
    const absentsToday = await pool.query('SELECT COUNT(*)::int AS count FROM eleves WHERE absences > 0 AND absences - absences_justifiees > 0');
    const justifieesToday = await pool.query("SELECT COALESCE(SUM(absences_justifiees),0)::int AS total FROM eleves");
    const totalAbs = await pool.query("SELECT COALESCE(SUM(absences),0)::int AS total FROM eleves");
    res.json({
      totalEleves: total.rows[0].count,
      alertes: alerte.rows[0].count,
      absentsToday: absentsToday.rows[0].count,
      justifieesToday: justifieesToday.rows[0].total,
      injustifieesToday: Math.max(0, absentsToday.rows[0].count - justifieesToday.rows[0].total),
      totalAbsences: totalAbs.rows[0].total,
    });
  } catch (err) {
    res.json({ totalEleves: 0, alertes: 0, absentsToday: 0, justifieesToday: 0, injustifieesToday: 0, totalAbsences: 0 });
  }
});

module.exports = router;
