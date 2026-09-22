// 開発用のデモユーザーと初期家事データを投入するシードスクリプト。
// 実行: npm run prisma:seed
import bcrypt from "bcryptjs";

import { DEFAULT_HOUSEWORK_TASKS } from "../src/lib/defaultTasks";
import { prisma } from "../src/lib/prisma";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password1234";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log(`デモユーザーは既に存在します: ${DEMO_EMAIL}`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      name: "デモユーザー",
      tasks: { create: [...DEFAULT_HOUSEWORK_TASKS] },
    },
  });

  console.log(`デモユーザーを作成しました: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
