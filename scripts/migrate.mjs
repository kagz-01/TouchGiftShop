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
 *   node scripts/migrate.mjs --diff           # compare live DB against db/schema.sql
 *   node scripts/migrate.mjs --file <path>    # apply one file
 *
 * Requires DIRECT_DATABASE_URL or DATABASE_URL in .env.local (Supabase's
 * pooled or direct Postgres URL). Reads the same env the app uses.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { withSql } from "./db.mjs";

const ROOT = resolve(process.cwd());
const MIGRATIONS_DIR = join(ROOT, "db", "migrations");
const SCHEMA_FILE = join(ROOT, "db", "schema.sql");
const TRACKING_TABLE = "schema_migrations";

const args = process.argv.slice(2);
const wantStatus = args.includes("--status");
const wantDiff = args.includes("--diff");
const fileIdx = args.indexOf("--file");
const onlyFile = fileIdx !== -1 ? args[fileIdx + 1] : null;

// ── env ────────────────────────────────────────────────────────────────
// Connection handling (retry on the flaky pooler) lives in scripts/db.mjs.

// ── helpers ────────────────────────────────────────────────────────────
async function ensureTracking(sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
      name        text PRIMARY KEY,
      applied_at  timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function applied(sql) {
  await ensureTracking(sql);
  const rows = await sql`SELECT name FROM ${sql(TRACKING_TABLE)}`;
  return new Set(rows.map((r) => r.name));
}

function listMigrations() {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.error(`No migrations directory at ${MIGRATIONS_DIR}`);
    process.exit(1);
  }
  return readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
}

async function apply(sql, name) {
  const body = readFileSync(join(MIGRATIONS_DIR, name), "utf8");
  process.stdout.write(`  applying ${name} … `);
  try {
    // Each file runs in its own transaction; a failure rolls the file back
    // whole rather than leaving half a migration applied.
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`INSERT INTO ${sql(TRACKING_TABLE)} (name) VALUES (${name})
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
  await withSql(async (sql) => {
    if (wantDiff) {
      // db/schema.sql is the "build from scratch" reference and is ahead of the
      // live database in places. Only the live database can settle which shape
      // is real, so compare instead of guessing.
      if (!existsSync(SCHEMA_FILE)) throw new Error(`No ${SCHEMA_FILE}`);
      const schema = readFileSync(SCHEMA_FILE, "utf8");

      const liveTables = await sql.unsafe(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      const liveCols = await sql.unsafe(`
        SELECT table_name, column_name FROM information_schema.columns
        WHERE table_schema = 'public'
      `);
      const live = new Map();
      for (const c of liveCols) {
        if (!live.has(c.table_name)) live.set(c.table_name, new Set());
        live.get(c.table_name).add(c.column_name);
      }

      const declared = new Map();
      const re = /CREATE TABLE(?: IF NOT EXISTS)?\s+([a-z_]+)\s*\(/gi;
      let m;
      while ((m = re.exec(schema)) !== null) {
        const name = m[1];
        if (!declared.has(name)) declared.set(name, new Set());
        let i = schema.indexOf("(", m.index + m[0].length - 1);
        let depth = 0;
        while (i < schema.length) {
          if (schema[i] === "(") depth++;
          else if (schema[i] === ")") { depth--; if (!depth) break; }
          i++;
        }
        const body = schema.slice(m.index, i);
        const colRe = /^\s{2,}([a-z_][a-z0-9_]*)\s+[a-z]/gim;
        let c;
        while ((c = colRe.exec(body)) !== null) declared.get(name).add(c[1]);
      }

      const liveNames = new Set(liveTables.map((t) => t.table_name));
      let drift = 0;

      console.log("\n── tables in schema.sql but NOT in the live database ──");
      for (const t of [...declared.keys()].sort()) {
        if (!liveNames.has(t)) { console.log(`  - ${t}`); drift++; }
      }
      if (!drift) console.log("  (none)");

      console.log("\n── columns in schema.sql but NOT live ──");
      let colDrift = 0;
      for (const t of [...declared.keys()].sort()) {
        if (!liveNames.has(t)) continue;
        const missing = [...declared.get(t)].filter((c) => !live.get(t).has(c));
        if (missing.length) { console.log(`  ${t}: ${missing.join(", ")}`); colDrift++; }
      }
      if (!colDrift) console.log("  (none)");

      console.log("\n── live tables NOT in schema.sql ──");
      let extra = 0;
      for (const t of [...liveNames].sort()) {
        if (!declared.has(t)) { console.log(`  + ${t}`); extra++; }
      }
      if (!extra) console.log("  (none)");

      console.log(
        `\n${liveNames.size} live tables, ${declared.size} declared. ` +
          `${drift} missing table(s), ${colDrift} table(s) with missing columns, ${extra} undeclared.\n`
      );
      return;
    }

    const done = await applied(sql);
    const all = listMigrations();
    const pending = all.filter((f) => !done.has(f));

    if (wantStatus) {
      console.log(`\n${all.length} migration file(s), ${done.size} recorded.\n`);
      for (const f of all) console.log(`  ${done.has(f) ? "✓" : "·"} ${f}`);
      console.log(`\n${pending.length} pending.\n`);
      return;
    }

    if (onlyFile) {
      if (!all.includes(onlyFile)) throw new Error(`No such migration: ${onlyFile}`);
      console.log(`\nApplying ${onlyFile}\n`);
      await apply(sql, onlyFile);
      console.log("\nDone.\n");
      return;
    }

    if (!pending.length) {
      console.log("\nNothing pending — database is up to date.\n");
      return;
    }

    console.log(`\n${pending.length} pending migration(s):\n`);
    for (const f of pending) console.log(`  · ${f}`);
    console.log("");
    for (const f of pending) await apply(sql, f);
    console.log("\nAll applied.\n");
  });
} catch (err) {
  /* Swallowing this is how a broken identifier helper in applied() managed to
     look like a clean run for days. A migration tool that fails quietly is
     worse than no tool. */
  console.error(`\nMigration run failed: ${err?.message ?? err}\n`);
  if (err?.cause?.message) console.error(`  cause: ${err.cause.message}`);
  process.exit(1);
}
