import path from "node:path";

const DEFAULT_LOCAL_DATABASE_URL = `file:${path.join(
  process.cwd(),
  "data",
  "sqlite.db",
)}`;

export function shouldUseLocalDatabase(): boolean {
  if (process.env.VERCEL) return false;
  if (process.env.USE_REMOTE_DB === "true") return false;
  return true;
}

export function getDatabaseUrl(): string {
  if (!shouldUseLocalDatabase()) {
    const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();

    if (!tursoUrl) {
      throw new Error(
        "TURSO_DATABASE_URL и TURSO_AUTH_TOKEN должны быть заданы в переменных окружения Vercel",
      );
    }

    return tursoUrl;
  }

  const configured = process.env.DATABASE_URL?.trim();

  if (!configured) {
    return DEFAULT_LOCAL_DATABASE_URL;
  }

  return configured.startsWith("file:") ? configured : `file:${configured}`;
}

export function getDatabaseAuthToken(): string | undefined {
  if (shouldUseLocalDatabase()) return undefined;
  return process.env.TURSO_AUTH_TOKEN?.trim();
}
