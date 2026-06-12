const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: 'sgs_admin', host: 'localhost', database: 'sgs_db',
  password: 'sgs_pass_2026', port: 5432,
});

async function seed() {
  const existing = await pool.query("SELECT id, email, role FROM users WHERE role = 'enseignant'");
  if (existing.rows.length > 0) {
    console.log('Teacher already exists:', existing.rows[0].email);
    process.exit(0);
  }

  const hash = await bcrypt.hash('teacher123', 10);
  const user = await pool.query(
    `INSERT INTO users (nom, prenom, email, password, role, subject, initiales, actif)
     VALUES ('Alaoui', 'Ahmed', 'teacher@ecole.ma', $1, 'enseignant', 'maths', 'AA', true) RETURNING id`,
    [hash]
  );
  const uid = user.rows[0].id;

  await pool.query(
    `INSERT INTO teacher_assignments (user_id, subject, niveau, classe) VALUES
     ($1, 'maths', '1AC', 'A'),
     ($1, 'maths', '1AC', 'B'),
     ($1, 'maths', '2AC', 'A')`,
    [uid]
  );

  console.log('Teacher created: teacher@ecole.ma / teacher123');
  process.exit(0);
}

seed().catch(e => { console.error(e.message); process.exit(1); });
