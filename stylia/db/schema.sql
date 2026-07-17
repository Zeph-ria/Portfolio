-- ============================================================
-- StylIA — SQL schema (SQLite dialect, portable to Postgres)
-- All linear measurements are persisted in centimetres (canonical
-- unit); the UI converts to/from inches (1 in = 2.54 cm) on the fly.
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- Users / Profiles
-- role: 'hobbyist' | 'professional'
-- unit: 'cm' | 'inch' ; paper_format: 'A4' | 'USLetter' | 'A0'
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT    NOT NULL,
  display_name  TEXT    NOT NULL DEFAULT '',
  role          TEXT    NOT NULL DEFAULT 'hobbyist'
                CHECK (role IN ('hobbyist', 'professional')),
  unit          TEXT    NOT NULL DEFAULT 'cm'
                CHECK (unit IN ('cm', 'inch')),
  paper_format  TEXT    NOT NULL DEFAULT 'A4'
                CHECK (paper_format IN ('A4', 'USLetter', 'A0')),
  locale        TEXT    NOT NULL DEFAULT 'fr'
                CHECK (locale IN ('fr', 'en', 'es')),
  subscription_status TEXT NOT NULL DEFAULT 'none'
                CHECK (subscription_status IN ('none', 'active', 'past_due', 'canceled')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- Opaque session tokens (HttpOnly cookie holds the raw token,
-- only its SHA-256 hash is stored).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT    NOT NULL UNIQUE,
  expires_at  TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ------------------------------------------------------------
-- Measurements — one saved body profile ("Myself", "Client X"…)
-- Values stored in cm to the millimetre (REAL, 0.1 cm precision).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS measurements (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id              INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_name         TEXT    NOT NULL,
  unit                 TEXT    NOT NULL DEFAULT 'cm'
                       CHECK (unit IN ('cm', 'inch')),
  bust_circ            REAL    NOT NULL CHECK (bust_circ > 0),
  waist_circ           REAL    NOT NULL CHECK (waist_circ > 0),
  hip_circ             REAL    NOT NULL CHECK (hip_circ > 0),
  waist_to_hip_height  REAL    NOT NULL CHECK (waist_to_hip_height > 0),
  total_length         REAL    NOT NULL CHECK (total_length > 0),
  created_at           TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_measurements_user ON measurements(user_id);

-- ------------------------------------------------------------
-- Projects — one drafting job (photo -> sketch -> pattern)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  measurement_id   INTEGER REFERENCES measurements(id) ON DELETE SET NULL,
  name             TEXT    NOT NULL DEFAULT 'Untitled',
  garment_type     TEXT    NOT NULL DEFAULT 'straight_skirt_base',
  status           TEXT    NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'generated')),
  input_photo_url  TEXT,
  output_svg_url   TEXT,
  textile_tags     TEXT    NOT NULL DEFAULT '[]',  -- JSON array of textile slugs
  paid             INTEGER NOT NULL DEFAULT 0,     -- unlocked full-size export
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

-- ------------------------------------------------------------
-- Textiles — fabric knowledge base for the Intelligent Consultant
-- drape_type: 'fluid' | 'rigid' ; wash_shrinkage in % ; iron_temp in °C
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS textiles (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT NOT NULL UNIQUE,
  name_fr        TEXT NOT NULL,
  name_en        TEXT NOT NULL,
  name_es        TEXT NOT NULL,
  drape_type     TEXT NOT NULL CHECK (drape_type IN ('fluid', 'rigid')),
  wash_shrinkage REAL NOT NULL DEFAULT 0,
  iron_temp      INTEGER NOT NULL,
  tips_fr        TEXT NOT NULL,
  tips_en        TEXT NOT NULL,
  tips_es        TEXT NOT NULL
);

-- ------------------------------------------------------------
-- Payments — mock/native Stripe checkout sessions + webhooks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id         INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  stripe_session_id  TEXT    NOT NULL UNIQUE,
  amount_cents       INTEGER NOT NULL,
  currency           TEXT    NOT NULL DEFAULT 'eur',
  status             TEXT    NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(stripe_session_id);
