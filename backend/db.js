// PostgreSQL connection pool and startup helpers for the backend service.
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Credentials come from compose.yaml environment variables (defaults match local dev).
const pool = new Pool({
  host: process.env.PGHOST || 'db',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'app',
  password: process.env.PGPASSWORD || 'app',
  database: process.env.PGDATABASE || 'guestbook',
});

// Retry until PostgreSQL is ready — the db container may still be initializing.
async function waitForDb(maxAttempts = 30, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (attempt === maxAttempts) {
        throw err;
      }
      console.log(`Waiting for database (${attempt}/${maxAttempts})...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// Idempotent schema setup — safe to run on every startup (uses IF NOT EXISTS).
async function initSchema() {
  const schemaPath = path.join(__dirname, 'init.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
}

module.exports = { pool, waitForDb, initSchema };
