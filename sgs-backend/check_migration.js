const { Pool } = require('pg');
const pool = new Pool({
  user: 'sgs_admin',
  host: 'localhost',
  database: 'sgs_db',
  password: 'sgs_pass_2026',
  port: 5432,
});

async function check() {
  const res = await pool.query(
    `SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_name = 'resultats'
     ORDER BY ordinal_position`
  );
  console.log('Columns in resultats table:');
  res.rows.forEach(c => console.log(' -', c.column_name, '(' + c.data_type + ')'));

  const count = await pool.query('SELECT COUNT(*)::int FROM resultats');
  console.log('\nTotal rows:', count.rows[0].count);

  const sample = await pool.query(
    'SELECT id, eleve_name, semestre, classe, eleve_id FROM resultats LIMIT 5'
  );
  console.log('\nSample data:');
  sample.rows.forEach(r => console.log('  id:', r.id, '| name:', r.eleve_name, '| sem:', r.semestre, '| class:', r.classe, '| eleve_id:', r.eleve_id));

  await pool.end();
}
check().catch(e => console.error(e));
