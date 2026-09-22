import nextConfig from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([".next/**", "node_modules/**", "prisma/dev.db"]),
  ...nextConfig,
]);
