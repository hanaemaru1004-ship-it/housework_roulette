import path from "node:path";

import { defineConfig } from "prisma/config";

// prisma CLI(migrate/seedなど)はNext.jsの自動env読み込みの外で動くため、
// ここで明示的に.envを読み込む(Next.js本体の実行には影響しない)。
try {
  process.loadEnvFile();
} catch {
  // .envが存在しない場合は何もしない(DATABASE_URLが未設定ならCLI側でエラーになる)。
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
