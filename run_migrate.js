const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function readConnectionString() {
  const txtPath = path.join(__dirname, 'supabase.txt');
  if (!fs.existsSync(txtPath)) throw new Error('supabase.txt not found in project root');
  const txt = fs.readFileSync(txtPath, 'utf8');
  const m = txt.match(/postgresql:\/\/[^\s]+/m);
  if (!m) throw new Error('No postgresql connection string found in supabase.txt');
  return m[0].trim();
}

async function run() {
  const conn = readConnectionString();
  const sql = fs.readFileSync(path.join(__dirname, 'supabase_schema.sql'), 'utf8');

  const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected. Applying schema...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Migration error:', err);
    try { await client.query('ROLLBACK'); } catch (e) {}
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
