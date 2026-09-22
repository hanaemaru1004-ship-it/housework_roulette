"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/tasks";

async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("ログインが必要です");
  }
  return userId;
}

// Server Actionは実質POSTエンドポイントとして直接呼び出せてしまうため、
// クライアントの実装を信頼せずここでも入力を検証する。
const completeHouseworkInputSchema = z.object({
  taskId: z.string().min(1),
  taskName: z.string().min(1).max(50),
  durationMin: z.number().int().min(1).max(1440),
});

export type CompleteHouseworkInput = z.infer<typeof completeHouseworkInputSchema>;

/** タイマー完了時に履歴へ1件登録する。家事名・所要時間はその時点の値をスナップショット保存する。 */
export async function completeHousework(
  input: CompleteHouseworkInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = completeHouseworkInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容が正しくありません" };
  }

  const userId = await requireUserId();

  // taskIdは自分が所有する家事の場合のみ紐付ける(他ユーザーの家事IDを指定されても無視する)。
  const owned = await prisma.houseworkTask.findFirst({
    where: { id: parsed.data.taskId, userId },
    select: { id: true },
  });

  const entry = await prisma.historyEntry.create({
    data: {
      userId,
      taskId: owned ? owned.id : null,
      taskName: parsed.data.taskName,
      durationMin: parsed.data.durationMin,
    },
  });

  revalidatePath("/history");
  revalidatePath("/home");
  return { ok: true, data: { id: entry.id } };
}
