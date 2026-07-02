import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { getDatabaseAuthToken, getDatabaseUrl } from "@/db/config";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as {
  client?: Client;
  db?: ReturnType<typeof drizzle<typeof schema>>;
  migrated?: boolean;
  connectionKey?: string;
};

function getClientConfig() {
  const url = getDatabaseUrl();
  const authToken = getDatabaseAuthToken();

  if (url.startsWith("file:")) {
    const filePath = url.slice("file:".length);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  return authToken ? { url, authToken } : { url };
}

function getConnectionKey() {
  const { url, authToken } = getClientConfig();
  return JSON.stringify({ url, authToken: authToken ?? null });
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
  const connectionKey = getConnectionKey();

  if (globalForDb.connectionKey !== connectionKey) {
    globalForDb.client = undefined;
    globalForDb.db = undefined;
    globalForDb.migrated = undefined;
    globalForDb.connectionKey = connectionKey;
  }

  if (!globalForDb.db) {
    const { client, db } = createDatabase();
    globalForDb.client = client;
    globalForDb.db = db;
    await ensureMigrated(db);
  }

  return globalForDb.db;
}
