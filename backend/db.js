const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL,
  ssl: (process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || '').includes('supabase.co') || (process.env.NETLIFY_DATABASE_URL || '').includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false
});


// Auto-migration on first connect
const initDb = async () => {
  try {
    console.log('Verifying database schema...');
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS hubs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                slug VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(100),
                description TEXT,
                theme_config JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS links (
                id SERIAL PRIMARY KEY,
                hub_id INTEGER REFERENCES hubs(id),
                title VARCHAR(100) NOT NULL,
                url TEXT NOT NULL,
                icon VARCHAR(50),
                position INTEGER DEFAULT 0,
                clicks INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS rules (
                id SERIAL PRIMARY KEY,
                hub_id INTEGER REFERENCES hubs(id),
                name VARCHAR(100),
                type VARCHAR(50) NOT NULL,
                conditions JSONB NOT NULL,
                action JSONB NOT NULL,
                priority INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS analytics (
                id SERIAL PRIMARY KEY,
                hub_id INTEGER REFERENCES hubs(id),
                link_id INTEGER REFERENCES links(id),
                event_type VARCHAR(50) NOT NULL,
                visitor_id VARCHAR(100),
                device_type VARCHAR(50),
                country VARCHAR(5),
                user_agent TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    console.log('Database schema verified/created.');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

// We don't block here, but it will run on first require
initDb();


module.exports = {
  exec: async (sql) => {
    const client = await pool.connect();
    try {
      await client.query(sql);
    } finally {
      client.release();
    }
  },
  query: async (sql, params = []) => {
    const res = await pool.query(sql, params);
    return res.rows;
  },
  get: async (sql, params = []) => {
    const res = await pool.query(sql, params);
    return res.rows[0];
  },
  run: async (sql, params = []) => {
    const res = await pool.query(sql, params);
    return {
      lastInsertRowid: res.rows[0]?.id,
      changes: res.rowCount
    };
  },
  pool
};
