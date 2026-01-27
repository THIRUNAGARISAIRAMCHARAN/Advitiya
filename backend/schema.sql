CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hubs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  slug VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100),
  description TEXT,
  theme_config JSONB, -- For custom themes (colors, fonts)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  hub_id INTEGER REFERENCES hubs(id),
  title VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(50),
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rules (
  id SERIAL PRIMARY KEY,
  hub_id INTEGER REFERENCES hubs(id),
  name VARCHAR(100),
  type VARCHAR(50) NOT NULL, -- 'time', 'device', 'location', 'performance'
  conditions JSONB NOT NULL, -- e.g. { "start_time": "09:00", "end_time": "17:00" } or { "device": "mobile" }
  action JSONB NOT NULL, -- e.g. { "type": "reorder", "target_link_id": 123, "new_position": 0 }
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  hub_id INTEGER REFERENCES hubs(id),
  link_id INTEGER REFERENCES links(id),
  event_type VARCHAR(50) NOT NULL, -- 'view', 'click'
  visitor_id VARCHAR(100), -- Anonymized cookie/fingerprint
  device_type VARCHAR(50),
  country VARCHAR(5),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
