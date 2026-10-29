// 開発用のデモユーザーと初期家事データを投入するシードスクリプト。
// 実行: npm run prisma:seed
import bcrypt from "bcryptjs";

import { DEFAULT_HOUSEWORK_TASKS } from "../src/lib/defaultTasks";
import { prisma } from "../src/lib/prisma";

const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "password1234";

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: DEMO_USERNAME } });
  if (existing) {
    console.log(`デモユーザーは既に存在します: ${DEMO_USERNAME}`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.user.create({
    data: {
      username: DEMO_USERNAME,
      passwordHash,
      name: "デモユーザー",
      tasks: { create: [...DEFAULT_HOUSEWORK_TASKS] },
    },
  });

  console.log(`デモユーザーを作成しました: ${DEMO_USERNAME} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
