#!/usr/bin/env node
/**
 * Removes corporate diagnostic/test rows so the platform sits in a true empty
 * state for production development.
 *
 * Deliberately narrow: it matches on the exact company names used by the
 * connectivity checks, never a broad "delete all". There is no --force and no
 * wildcard — if it doesn't match a known test marker it does nothing.
 *
 * Usage:
 *   node scripts/cleanup-test-rows.mjs            # dry run, prints what it would delete
 *   node scripts/cleanup-test-rows.mjs --apply    # actually delete
 *
 * Test markers (case-insensitive substring match on company_name):
 *   corporate_quote_requests : DiagCo, FallbackProof, FallbackCheck, DiagPolo,
                              Diagnostic, MigrationProof, PostMigration
 *   corporate_inquiries      : DiagCo
 */

import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import postgres from "postgres";

const ROOT = resolve(process.cwd());
const apply = process.argv.includes("--apply");

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
  console.error("No DIRECT_DATABASE_URL or DATABASE_URL in .env.local.");
  process.exit(1);
}

const MARKERS = {
  corporate_quote_requests: ["diagco", "fallbackproof", "fallbackcheck", "diagpolo", "diagnostic", "migrationproof", "postmigration"],
  corporate_inquiries: ["diagco"],
};

const sql = postgres(url, { max: 1, ssl: "require", connect_timeout: 15 });

try {
  console.log(apply ? "\nAPPLYING\n" : "\nDRY RUN — nothing will be deleted. Pass --apply to confirm.\n");

  for (const [table, markers] of Object.entries(MARKERS)) {
    const rows = await sql.unsafe(
      `SELECT id, company_name FROM ${table} WHERE ${markers
        .map((m) => `company_name ILIKE ${sql`'%${m}%'}`)
        .join(" OR ")}`
    );
    if (!rows.length) {
      console.log(`  ${table}: nothing matching`);
      continue;
    }
    console.log(`  ${table}: ${rows.length} row(s)`);
    for (const r of rows) {
      console.log(`    ${r.id}  "${r.company_name}"`);
    }
    if (apply) {
      await sql.unsafe(
        `DELETE FROM ${table} WHERE ${markers
          .map((m) => `company_name ILIKE ${sql`'%${m}%'}`)
          .join(" OR ")}`
      );
      console.log(`    → deleted`);
    }
  }

  console.log(apply ? "\nDone. Counts should now read 0.\n" : "\nNothing was deleted.\n");
  await sql.end();
  process.exit(0);
} catch (err) {
  console.error("\n", err.message, "\n");
  await sql.end().catch(() => {});
  process.exit(1);
}
