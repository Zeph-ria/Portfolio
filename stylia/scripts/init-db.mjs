#!/usr/bin/env node
/**
 * StylIA database bootstrap.
 *   npm run db:init          -> create schema + seed textiles (idempotent)
 *   npm run db:reset         -> drop the database file and rebuild
 */
import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = process.env.STYLIA_DB_PATH ?? join(root, 'data', 'stylia.db');

if (process.argv.includes('--reset') && existsSync(dbPath)) {
  rmSync(dbPath);
  console.log(`✂  removed ${dbPath}`);
}

mkdirSync(dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(readFileSync(join(root, 'db', 'schema.sql'), 'utf8'));
db.exec(readFileSync(join(root, 'db', 'seed.sql'), 'utf8'));

const textiles = db.prepare('SELECT COUNT(*) AS n FROM textiles').get();
console.log(`✔  StylIA database ready at ${dbPath} (${textiles.n} textiles seeded)`);
db.close();
