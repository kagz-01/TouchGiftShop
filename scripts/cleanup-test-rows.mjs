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
 * A marked company takes its whole tenant with it: members, quotes and
 * inquiries hanging off that account go too. Deleting the account alone would
 * orphan them (the foreign keys are ON DELETE SET NULL), leaving rows that no
 * longer belong to anything and that the next person mistakes for real data.
 */

import { withSql } from "./db.mjs";

const apply = process.argv.includes("--apply");

/* Each table identifies its company differently — quotes and inquiries carry a
   name, the account and its members carry an email. */
const LABEL_COLUMN = {
  corporate_accounts: "company_name",
  corporate_account_members: "email",
};

const MARKERS = {
  corporate_quote_requests: [
    "diagco", "fallbackproof", "fallbackcheck", "diagpolo",
    "diagnostic", "migrationproof", "postmigration", "dashboard qa",
  ],
  corporate_inquiries: ["diagco"],
  corporate_accounts: ["portal qa"],
  corporate_account_members: ["portal-qa"],
};

/* Positional parameters rather than an interpolated tagged template: nesting
   sql`...` inside a plain template literal stringifies it into a JS array and
   the server sees a literal "[". Numbered placeholders take a parameter list,
   so a marker containing a quote can never become SQL. */
const clauseFor = (markers, column = "company_name") =>
  markers.map((_, i) => `${column} ILIKE $${i + 1}`).join(" OR ");
const valuesFor = (markers) => markers.map((m) => `%${m}%`);

await withSql(async (sql) => {
  console.log(apply ? "\nAPPLYING\n" : "\nDRY RUN — nothing will be deleted. Pass --apply to confirm.\n");

  // 1. Which test accounts are in the way?
  const accountClause = clauseFor(MARKERS.corporate_accounts, "company_name");
  const accountValues = valuesFor(MARKERS.corporate_accounts);
  const accounts = await sql.unsafe(
    `SELECT id, company_name FROM corporate_accounts WHERE ${accountClause}`,
    accountValues
  );
  const accountIds = accounts.map((a) => a.id);

  // 2. Members of those accounts, plus any stragglers matched by email marker.
  const memberClauses = [`corporate_account_id = ANY($1)`];
  const memberValues = [`{${accountIds.join(",")}}`];
  if (MARKERS.corporate_account_members.length) {
    MARKERS.corporate_account_members.forEach((_, i) => memberClauses.push(`email ILIKE $${i + 2}`));
    memberValues.push(...valuesFor(MARKERS.corporate_account_members));
  }

  // 3. Quotes and inquiries: by name marker, or by belonging to a test account.
  const ownedClauses = (markerStart) => {
    const clauses = ["corporate_account_id = ANY($1)"];
    const values = [`{${accountIds.join(",")}}`];
    MARKERS.corporate_quote_requests.forEach((_, i) => clauses.push(`company_name ILIKE $${i + markerStart}`));
    values.push(...valuesFor(MARKERS.corporate_quote_requests));
    return { clauses, values };
  };

  const steps = [
    { table: "corporate_account_members", label: "email", clauses: memberClauses, values: memberValues },
    {
      table: "corporate_quote_requests",
      label: "product_name",
      ...ownedClauses(2),
    },
    {
      table: "corporate_inquiries",
      label: "company_name",
      clauses: ["corporate_account_id = ANY($1)", ...MARKERS.corporate_inquiries.map((_, i) => `company_name ILIKE $${i + 2}`)],
      values: [`{${accountIds.join(",")}}`, ...valuesFor(MARKERS.corporate_inquiries)],
    },
  ];

  for (const step of steps) {
    const { table, label, clauses, values } = step;
    const where = clauses.join(" OR ");
    const rows = await sql.unsafe(`SELECT id, ${label} AS label FROM ${table} WHERE ${where}`, values);
    if (!rows.length) {
      console.log(`  ${table}: nothing matching`);
      continue;
    }
    console.log(`  ${table}: ${rows.length} row(s)`);
    for (const r of rows) console.log(`    ${r.id}  "${r.label}"`);
    if (apply) {
      await sql.unsafe(`DELETE FROM ${table} WHERE ${where}`, values);
      console.log(`    → deleted`);
    }
  }

  if (accounts.length) {
    console.log(`  corporate_accounts: ${accounts.length} row(s)`);
    for (const a of accounts) console.log(`    ${a.id}  "${a.company_name}"`);
    if (apply) {
      await sql.unsafe(`DELETE FROM corporate_accounts WHERE ${accountClause}`, accountValues);
      console.log(`    → deleted`);
    }
  } else {
    console.log("  corporate_accounts: nothing matching");
  }

  console.log(apply ? "\nDone. Counts should now read 0.\n" : "\nNothing was deleted.\n");
}).catch((err) => {
  console.error(`\nCleanup failed: ${err?.message ?? err}\n`);
  process.exit(1);
});
