import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/lib/schema.server.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:data/waste.db",
  },
});
