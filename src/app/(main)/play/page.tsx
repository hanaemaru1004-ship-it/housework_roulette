import { redirect } from "next/navigation";

import { PlayFlow } from "@/components/roulette/PlayFlow";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RECENT_PENALTY_WINDOW, type Condition } from "@/lib/roulette";
import { CONDITION_OPTIONS, TIME_OPTIONS } from "@/lib/validation";

type SearchParams = { minutes?: string; condition?: string };

function isValidCondition(value: string | undefined): value is Condition {
  return CONDITION_OPTIONS.some((option) => option.value === value);
}

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { minutes: minutesParam, condition: conditionParam } = await searchParams;
  const minutes = Number(minutesParam);

  // 不正なクエリ(直接URLを触った場合など)ならホームへ戻す。
  if (!TIME_OPTIONS.includes(minutes as (typeof TIME_OPTIONS)[number]) || !isValidCondition(conditionParam)) {
    redirect("/home");
  }

  const session = await auth();
  const userId = session!.user.id;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [tasks, recentHistories, todaysHistory] = await Promise.all([
    prisma.houseworkTask.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true, durationMin: true, difficulty: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.historyEntry.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: RECENT_PENALTY_WINDOW,
      select: { taskId: true },
    }),
    prisma.historyEntry.findMany({
      where: { userId, completedAt: { gte: startOfToday } },
      orderBy: { completedAt: "desc" },
      select: { id: true, taskName: true, durationMin: true, completedAt: true },
    }),
  ]);

  const recentTaskIdsDesc = recentHistories
    .map((h) => h.taskId)
    .filter((id): id is string => id !== null);

  return (
    <PlayFlow
      tasks={tasks}
      selectedMinutes={minutes}
      condition={conditionParam}
      recentTaskIdsDesc={recentTaskIdsDesc}
      initialTodaysHistory={todaysHistory}
    />
  );
}
