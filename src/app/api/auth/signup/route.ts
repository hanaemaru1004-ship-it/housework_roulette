import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { DEFAULT_HOUSEWORK_TASKS } from "@/lib/defaultTasks";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";

const SALT_ROUNDS = 10;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容が正しくありません" },
      { status: 400 },
    );
  }

  const { username, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json(
      { error: "このユーザー名は既に登録されています" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // ユーザー作成と初期家事データの投入を1つのトランザクションで行う。
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { username, passwordHash, name },
    });
    await tx.houseworkTask.createMany({
      data: DEFAULT_HOUSEWORK_TASKS.map((task) => ({
        ...task,
        userId: created.id,
      })),
    });
    return created;
  });

  return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
}
