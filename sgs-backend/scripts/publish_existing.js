const pool = require('../db');

async function main() {
  const courses = await pool.query("UPDATE courses SET status = 'published' WHERE status IS NULL OR status = 'draft'");
  console.log('Courses updated:', courses.rowCount);
  const exercises = await pool.query("UPDATE exercises SET status = 'published' WHERE status IS NULL OR status = 'draft'");
  console.log('Exercises updated:', exercises.rowCount);
  process.exit(0);
}
main().catch(err => { console.error(err.message); process.exit(1); });
