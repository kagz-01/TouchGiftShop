#!/usr/bin/env node
/**
 * Applies db/migrations/*.sql to the live Supabase Postgres database.
 *
 * Why this exists: the Phase 1 corporate-quote columns were committed to
 * supabase/migrations/ but never executed, and the code that writes them was
 * live in the same deploy. Postgres then rejects every insert with 42703
 * (undefined_column) — the first real corporate enquiry would have been
 * unsaveable. `quote-request` now degrades to core columns as a safety net,
 * but that only stops the bleeding; run this to get the full schema.
 *
 * Usage:
 *   node scripts/migrate.mjs                  # apply everything pending
 *   node scripts/migrate.mjs --status         # list applied / pending
 *   node scripts/migrate.mjs --file <path>    # apply one file
 *
 * Requires DIRECT_DATABASE_URL or DATABASE_URL in .env.local (Supabase's
 * pooled or direct Postgres URL). Reads the same env the app uses.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import postgres from "postgres";

const ROOT = resolve(process.cwd());
const MIGRATIONS_DIR = join(ROOT, "db", "migrations");
const TRACKING_TABLE = "schema_migrations";

const args = process.argv.slice(2);
const wantStatus = args.includes("--status");
const fileIdx = args.indexOf("--file");
const onlyFile = fileIdx !== -1 ? args[fileIdx + 1] : null;

// ── env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (!process.env[m[1]]) process.env[m[1]] = value;
  }
}
loadEnv();

const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.error(
    "No DIRECT_DATABASE_URL or DATABASE_URL in .env.local.\n" +
      "Supabase: Project Settings → Database → Connection string."
  );
  process.exit(1);
}

const sql = postgres(url, { max: 1, ssl: "require", connect_timeout: 15 });

// ── helpers ────────────────────────────────────────────────────────────
async function ensureTracking() {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
      name        text PRIMARY KEY,
      applied_at  timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function applied() {
  await ensureTracking();
  const rows = await sql`SELECT name FROM ${sql.TRACKING_TABLE}`;
  return new Set(rows.map((r) => r.name));
}

function listMigrations() {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.error(`No migrations directory at ${MIGRATIONS_DIR}`);
    process.exit(1);
  }
  return readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
}

async function apply(name) {
  const body = readFileSync(join(MIGRATIONS_DIR, name), "utf8");
  process.stdout.write(`  applying ${name} … `);
  try {
    // Each file runs in its own transaction; a failure rolls the file back
    // whole rather than leaving half a migration applied.
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`INSERT INTO ${sql.TRACKING_TABLE} (name) VALUES (${name})
                ON CONFLICT (name) DO NOTHING`;
    });
    console.log("ok");
  } catch (err) {
    console.log("FAILED");
    console.error(`\n  ${err.message}\n`);
    throw err;
  }
}

// ── main ───────────────────────────────────────────────────────────────
try {
  const done = await applied();
  const all = listMigrations();
  const pending = all.filter((f) => !done.has(f));

  if (wantStatus) {
    console.log(`\n${all.length} migration file(s), ${done.size} recorded.\n`);
    for (const f of all) {
      console.log(`  ${done.has(f) ? "✓" : "·"} ${f}`);
    }
    console.log(`\n${pending.length} pending.\n`);
    await sql.end();
    process.exit(0);
  }

  if (onlyFile) {
    if (!all.includes(onlyFile)) {
      console.error(`No such migration: ${onlyFile}`);
      await sql.end();
      process.exit(1);
    }
    console.log(`\nApplying ${onlyFile}\n`);
    await apply(onlyFile);
    console.log("\nDone.\n");
    await sql.end();
    process.exit(0);
  }

  if (!pending.length) {
    console.log("\nNothing pending — database is up to date.\n");
    await sql.end();
    process.exit(0);
  }

  console.log(`\n${pending.length} pending migration(s):\n`);
  for (const f of pending) console.log(`  · ${f}`);
  console.log("");
  for (const f of pending) await apply(f);
  console.log("\nAll applied.\n");
  await sql.end();
  process.exit(0);
} catch {
  await sql.end().catch(() => {});
  process.exit(1);
}
