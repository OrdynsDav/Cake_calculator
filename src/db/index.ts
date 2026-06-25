import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

function getDatabasePath(): string {
  const configured = process.env.DATABASE_URL?.trim();

  if (!configured) {
    return path.join(process.cwd(), "data", "sqlite.db");
  }

  if (configured.startsWith("file:")) {
    return configured.slice("file:".length);
  }

  return configured;
}

function createDatabase() {
  const databasePath = getDatabasePath();

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const sqlite = new Database(databasePath);
  const db = drizzle(sqlite, { schema });

  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

  return { sqlite, db };
}

export function getDb() {
  if (!globalForDb.db) {
    const { sqlite, db } = createDatabase();
    globalForDb.sqlite = sqlite;
    globalForDb.db = db;
  }

  return globalForDb.db;
}
