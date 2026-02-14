const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

function readConnectionString() {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    throw new Error('DATABASE_URL not found in .env.local');
  }
  return connStr;
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
