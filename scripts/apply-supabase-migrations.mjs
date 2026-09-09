#!/usr/bin/env node
/**
 * Applies pending SQL migrations to the linked Supabase project.
 *
 * Requires SUPABASE_DB_URL in .env.local, e.g.
 * postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const MIGRATION_FILES = [
  "supabase/migrations/004_notification_sleep_enabled.sql",
  "supabase/migrations/005_notification_dispatches.sql",
];

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // optional
  }
}

async function main() {
  loadEnvLocal();

  const connectionString = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(
      "SUPABASE_DB_URL is not set. Add your Supabase direct connection string to .env.local and rerun.",
    );
    process.exit(1);
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    for (const file of MIGRATION_FILES) {
      const sql = readFileSync(resolve(process.cwd(), file), "utf8");
      console.log(`Applying ${file}...`);
      await client.query(sql);
      console.log(`Applied ${file}`);
    }
    console.log("All pending migrations applied.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
