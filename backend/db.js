const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    slug TEXT UNIQUE NOT NULL,
    title TEXT,
    description TEXT,
    theme_config TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hub_id INTEGER REFERENCES hubs(id),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    position INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hub_id INTEGER REFERENCES hubs(id),
    link_id INTEGER REFERENCES links(id),
    event_type TEXT NOT NULL,
    visitor_id TEXT,
    device_type TEXT,
    country TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = {
    exec: (sql) => db.exec(sql),
    query: (sql, params = []) => db.prepare(sql).all(params),
    get: (sql, params = []) => db.prepare(sql).get(params),
    run: (sql, params = []) => db.prepare(sql).run(params),
};
