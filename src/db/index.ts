import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as {
  client?: Client;
  db?: ReturnType<typeof drizzle<typeof schema>>;
  migrated?: boolean;
};

function getClientConfig() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (tursoUrl) {
    return {
      url: tursoUrl,
      authToken: tursoToken,
    };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "TURSO_DATABASE_URL и TURSO_AUTH_TOKEN должны быть заданы в переменных окружения Vercel",
    );
  }

  const configured = process.env.DATABASE_URL?.trim();
  const databasePath = configured
    ? configured.startsWith("file:")
      ? configured
      : `file:${configured}`
    : `file:${path.join(process.cwd(), "data", "sqlite.db")}`;

  if (databasePath.startsWith("file:")) {
    const filePath = databasePath.slice("file:".length);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  return { url: databasePath };
}

function createDatabase() {
  const client = createClient(getClientConfig());
  const db = drizzle(client, { schema });

  return { client, db };
}

async function ensureMigrated(db: ReturnType<typeof drizzle<typeof schema>>) {
  if (globalForDb.migrated) return;

  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  globalForDb.migrated = true;
}

export async function getDb() {
  if (!globalForDb.db) {
    const { client, db } = createDatabase();
    globalForDb.client = client;
    globalForDb.db = db;
    await ensureMigrated(db);
  }

  return globalForDb.db;
}
