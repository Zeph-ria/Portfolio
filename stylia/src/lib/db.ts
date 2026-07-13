import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Singleton SQLite connection. The schema + seed are applied lazily on
 * first access so `next dev` works out of the box without a manual
 * migration step (still available via `npm run db:init`).
 */
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath =
    process.env.STYLIA_DB_PATH ?? join(process.cwd(), 'data', 'stylia.db');
  mkdirSync(dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf8'));
  db.exec(readFileSync(join(process.cwd(), 'db', 'seed.sql'), 'utf8'));
  migrate(db);

  return db;
}

/** Additive migrations for databases created before a column existed. */
function migrate(db: Database.Database): void {
  const cols = (db.prepare('PRAGMA table_info(measurements)').all() as { name: string }[]).map(
    (c) => c.name,
  );
  // "Petites hanches" (small-hip) measures — optional, size-chart fallback
  // applies when NULL (girth = hip − 11 cm, height = half hip height).
  if (!cols.includes('small_hip_circ')) {
    db.exec('ALTER TABLE measurements ADD COLUMN small_hip_circ REAL');
  }
  if (!cols.includes('small_hip_height')) {
    db.exec('ALTER TABLE measurements ADD COLUMN small_hip_height REAL');
  }
}

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------
export type Role = 'hobbyist' | 'professional';
export type Unit = 'cm' | 'inch';
export type PaperFormat = 'A4' | 'USLetter' | 'A0';
export type Locale = 'fr' | 'en' | 'es';

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  display_name: string;
  role: Role;
  unit: Unit;
  paper_format: PaperFormat;
  locale: Locale;
  subscription_status: 'none' | 'active' | 'past_due' | 'canceled';
  created_at: string;
}

export interface MeasurementRow {
  id: number;
  user_id: number;
  profile_name: string;
  unit: Unit;
  bust_circ: number;
  waist_circ: number;
  hip_circ: number;
  waist_to_hip_height: number;
  total_length: number;
  small_hip_circ: number | null;
  small_hip_height: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: number;
  user_id: number;
  measurement_id: number | null;
  name: string;
  garment_type: string;
  status: 'draft' | 'generated';
  input_photo_url: string | null;
  output_svg_url: string | null;
  textile_tags: string;
  paid: number;
  created_at: string;
  updated_at: string;
}

export interface TextileRow {
  id: number;
  slug: string;
  name_fr: string;
  name_en: string;
  name_es: string;
  drape_type: 'fluid' | 'rigid';
  wash_shrinkage: number;
  iron_temp: number;
  tips_fr: string;
  tips_en: string;
  tips_es: string;
}

export interface PaymentRow {
  id: number;
  user_id: number;
  project_id: number | null;
  stripe_session_id: string;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  created_at: string;
  updated_at: string;
}
