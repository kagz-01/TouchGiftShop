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
 *                              Diagnostic, MigrationProof, PostMigration,
 *                              Dashboard QA
 *   corporate_inquiries      : DiagCo
 */

import { withSql } from "./db.mjs";

const apply = process.argv.includes("--apply");

const MARKERS = {
  corporate_quote_requests: ["diagco", "fallbackproof", "fallbackcheck", "diagpolo", "diagnostic", "migrationproof", "postmigration", "dashboard qa"],
  corporate_inquiries: ["diagco"],
};

/* Positional parameters rather than an interpolated tagged template: nesting
   sql`...` inside a plain template literal stringifies it into a JS array and
   the server sees a literal "[". Numbered placeholders take a parameter list,
   so a marker containing a quote can never become SQL. */
const clauseFor = (markers) =>
  markers.map((_, i) => `company_name ILIKE $${i + 1}`).join(" OR ");
const valuesFor = (markers) => markers.map((m) => `%${m}%`);

await withSql(async (sql) => {
  console.log(apply ? "\nAPPLYING\n" : "\nDRY RUN — nothing will be deleted. Pass --apply to confirm.\n");

  for (const [table, markers] of Object.entries(MARKERS)) {
    const clause = clauseFor(markers);
    const values = valuesFor(markers);
    const rows = await sql.unsafe(`SELECT id, company_name FROM ${table} WHERE ${clause}`, values);
    if (!rows.length) {
      console.log(`  ${table}: nothing matching`);
      continue;
    }
    console.log(`  ${table}: ${rows.length} row(s)`);
    for (const r of rows) {
      console.log(`    ${r.id}  "${r.company_name}"`);
    }
    if (apply) {
      await sql.unsafe(`DELETE FROM ${table} WHERE ${clause}`, values);
      console.log(`    → deleted`);
    }
  }

  console.log(apply ? "\nDone. Counts should now read 0.\n" : "\nNothing was deleted.\n");
}).catch((err) => {
  console.error(`\nCleanup failed: ${err?.message ?? err}\n`);
  process.exit(1);
});
