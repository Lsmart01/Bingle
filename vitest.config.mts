import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same as tsconfig's "@/*" paths. Only "@/" so packages like @vitest/* still resolve.
    alias: [{ find: /^@\//, replacement: fileURLToPath(new URL("./", import.meta.url)) }],
  },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    // Each database test file boots its own in-memory Postgres.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
