const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({ user: 'sgs_admin', host: 'localhost', database: 'sgs_db', password: 'sgs_pass_2026', port: 5432 });
(async () => {
  const students = await pool.query('SELECT id, nom, prenom, niveau, classe FROM eleves WHERE user_id IS NULL LIMIT 1');
  if (!students.rows.length) { console.log('No unlinked students found'); process.exit(0); }
  const s = students.rows[0];
  const hash = await bcrypt.hash('student123', 10);
  const user = await pool.query(
    `INSERT INTO users (nom, prenom, email, password, role, initiales, actif) VALUES ($1, $2, $3, $4, 'eleve', $5, true) RETURNING id`,
    [s.nom, s.prenom, 'student@ecole.ma', hash, (s.nom[0] + s.prenom[0]).toUpperCase()]
  );
  await pool.query('UPDATE eleves SET user_id = $1 WHERE id = $2', [user.rows[0].id, s.id]);
  console.log(`Student user created: student@ecole.ma / student123 (linked to ${s.nom} ${s.prenom}, ${s.niveau} ${s.classe})`);
  process.exit(0);
})();
