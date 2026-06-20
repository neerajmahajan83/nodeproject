const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'nodedb.cs9kgqus0xgt.us-east-1.rds.amazonaws.com',
  database: 'postgres',
  password: 'NWbccwH9oTWumEU64PnY',
  port: 5432,
  ssl: {
        // This forces encryption and prevents the pg_hba.conf error
        rejectUnauthorized: false 
    }
});

// Create table with full schema
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    reset_token TEXT,
    reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Table creation error:', err);
  } else {
    console.log('Users table ready');
  }
  pool.end();
});
