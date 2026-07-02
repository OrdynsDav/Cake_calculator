import path from "node:path";

const DEFAULT_LOCAL_DATABASE_URL = `file:${path.join(
  process.cwd(),
  "data",
  "sqlite.db",
)}`;

type DatabaseMode = "local" | "remote";

function getManualDatabaseMode(): DatabaseMode | undefined {
  const mode = process.env.DATABASE_MODE?.trim().toLowerCase();

  if (mode === "local" || mode === "remote") {
    return mode;
  }

  if (process.env.USE_REMOTE_DB === "true") {
    return "remote";
  }

  if (process.env.USE_REMOTE_DB === "false") {
    return "local";
  }

  return undefined;
}

export function shouldUseLocalDatabase(): boolean {
  const manualMode = getManualDatabaseMode();

  if (manualMode) {
    return manualMode === "local";
  }

  if (process.env.VERCEL) return false;
  return true;
}

export function getDatabaseUrl(): string {
  if (!shouldUseLocalDatabase()) {
    const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();

    if (!tursoUrl) {
      throw new Error(
        "Для удаленной базы данных задайте TURSO_DATABASE_URL и TURSO_AUTH_TOKEN",
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
