#!/usr/bin/env node
/**
 * One place to open a Postgres connection to the live database.
 *
 * Why this exists: Supabase's pooler drops the TCP connection often enough
 * that scripts failed two runs in a row and succeeded on the third, from the
 * same machine, with the same credentials. A `postgres()` client created once
 * at import time has no way to recover from that, so every script ended in a
 * bare CONNECT_TIMEOUT.
 *
 * Usage:
 *   const { withSql } = await import("./scripts/db.mjs");
 *   await withSql(async (sql) => { ... });
 *
 * withSql() retries the *connection*, not the caller's query — a query that
 * failed halfway must not silently run twice.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import postgres from "postgres";

/* fileURLToPath, not URL.pathname: this repo lives in a directory with a space
   in it, which pathname hands back percent-encoded. */
const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

export function loadEnv() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (!process.env[m[1]]) process.env[m[1]] = value;
  }
}

export function databaseUrl() {
  const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "No DIRECT_DATABASE_URL or DATABASE_URL in .env.local.\n" +
        "Supabase: Project Settings → Database → Connection string."
    );
  }
  return url;
}

const isConnectionFailure = (err) =>
  /CONNECT_TIMEOUT|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|Connection terminated/i.test(
    err?.message ?? ""
  );

/**
 * Run `fn` with a connected client. Connection attempts are retried with a
 * short backoff; anything `fn` throws is rethrown untouched.
 */
export async function withSql(fn, { attempts = 4, quiet = false } = {}) {
  loadEnv();
  const url = databaseUrl();
  let lastErr;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const sql = postgres(url, {
      max: 1,
      ssl: "require",
      connect_timeout: 20,
      // "relation already exists, skipping" is expected on every run here —
      // the tracking table check is idempotent by design.
      onnotice: () => {},
      // The pooler complains about session-level prepare on long-lived
      // clients; disabling it keeps `sql.unsafe` predictable.
      prepare: false,
    });
    try {
      await sql`SELECT 1`;
      const result = await fn(sql);
      await sql.end({ timeout: 5 }).catch(() => {});
      return result;
    } catch (err) {
      await sql.end({ timeout: 5 }).catch(() => {});
      if (!isConnectionFailure(err) || attempt === attempts) throw err;
      lastErr = err;
      if (!quiet) {
        console.warn(
          `  connection attempt ${attempt}/${attempts} failed (${err.message.split("\n")[0]}) — retrying…`
        );
      }
      await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
  throw lastErr;
}
