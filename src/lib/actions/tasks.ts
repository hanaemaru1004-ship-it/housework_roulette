"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { houseworkTaskInputSchema, type HouseworkTaskInput } from "@/lib/validation";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type HouseworkTaskListItem = {
  id: string;
  name: string;
  durationMin: number;
  difficulty: number;
  category: string | null;
  description: string | null;
};

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("ログインが必要です");
  }
  return userId;
}

export async function createTask(input: HouseworkTaskInput): Promise<ActionResult<{ id: string }>> {
  const parsed = houseworkTaskInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が正しくありません" };
  }

  const userId = await requireUserId();
  const { category, description, ...rest } = parsed.data;

  const task = await prisma.houseworkTask.create({
    data: {
      ...rest,
      category: category || null,
      description: description || null,
      userId,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/home");
  return { ok: true, data: { id: task.id } };
}

export async function updateTask(
  id: string,
  input: HouseworkTaskInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = houseworkTaskInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が正しくありません" };
  }

  const userId = await requireUserId();
  const { category, description, ...rest } = parsed.data;

  // where句にuserIdも含めることで、他ユーザーの家事を編集できないようにする。
  const result = await prisma.houseworkTask.updateMany({
    where: { id, userId },
    data: {
      ...rest,
      category: category || null,
      description: description || null,
    },
  });

  if (result.count === 0) {
    return { ok: false, error: "対象の家事が見つかりません" };
  }

  revalidatePath("/tasks");
  revalidatePath("/home");
  return { ok: true, data: { id } };
}

export async function deleteTask(id: string): Promise<ActionResult<void>> {
  const userId = await requireUserId();

  // 履歴の整合性を保つため物理削除ではなく論理削除にする。
  const result = await prisma.houseworkTask.updateMany({
    where: { id, userId },
    data: { isActive: false },
  });

  if (result.count === 0) {
    return { ok: false, error: "対象の家事が見つかりません" };
  }

  revalidatePath("/tasks");
  revalidatePath("/home");
  return { ok: true, data: undefined };
}
