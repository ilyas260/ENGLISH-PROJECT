const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function main() {
  const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'themes'");
  console.log('Columns in themes:', cols.rows.map(r => r.column_name));
  const themes = await pool.query('SELECT id, title FROM themes ORDER BY id');
  console.log('Existing themes count:', themes.rows.length);
  themes.rows.forEach(t => console.log(`  ${t.id}: ${t.title}`));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
