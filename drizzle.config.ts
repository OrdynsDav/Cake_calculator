import { defineConfig } from "drizzle-kit";
import {
  getDatabaseAuthToken,
  getDatabaseUrl,
} from "./src/db/config";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: getDatabaseUrl(),
    authToken: getDatabaseAuthToken(),
  },
});
