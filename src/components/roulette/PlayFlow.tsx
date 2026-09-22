"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { AchievementBadge } from "@/components/roulette/AchievementBadge";
import { RouletteReel } from "@/components/roulette/RouletteReel";
import { ResultCard } from "@/components/roulette/ResultCard";
import { TodaysHistoryList, type TodaysHistoryItem } from "@/components/roulette/TodaysHistoryList";
import { TaskTimer } from "@/components/timer/TaskTimer";
import { Button } from "@/components/ui/button";
import { completeHousework } from "@/lib/actions/history";
import { filterTasksWithinTime, selectHousework, type Condition, type RouletteTask } from "@/lib/roulette";
import { resolveTimeUpperBound } from "@/lib/validation";

export type PlayTask = {
  id: string;
  name: string;
  durationMin: number;
  difficulty: number;
};

type Step = "spinning" | "result" | "timer" | "complete";

type Props = {
  tasks: PlayTask[];
  selectedMinutes: number;
  condition: Condition;
  recentTaskIdsDesc: string[];
  initialTodaysHistory: TodaysHistoryItem[];
};

export function PlayFlow({
  tasks,
  selectedMinutes,
  condition,
  recentTaskIdsDesc,
  initialTodaysHistory,
}: Props) {
  const router = useRouter();
  const rouletteTasks: RouletteTask[] = tasks.map((t) => ({
    id: t.id,
    durationMin: t.durationMin,
    difficulty: t.difficulty,
  }));

  // 「1時間以上」が選ばれた場合は60分ちょうどが上限なのではなく上限なしを意味するため変換する。
  const timeUpperBound = resolveTimeUpperBound(selectedMinutes);

  const [step, setStep] = useState<Step>("spinning");
  const [completedMinutes, setCompletedMinutes] = useState<number | null>(null);
  const [todaysHistory, setTodaysHistory] = useState<TodaysHistoryItem[]>(initialTodaysHistory);
  // マウント時に1回だけ抽選する。遅延初期化を使うことでStrictModeの二重レンダーでも安全にしている。
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(() => {
    if (rouletteTasks.length === 0) return null;
    return selectHousework({
      tasks: rouletteTasks,
      selectedMinutes: timeUpperBound,
      condition,
      recentTaskIdsDesc,
    }).taskId;
  });

  const currentTask = tasks.find((t) => t.id === currentTaskId) ?? null;
  // 演出中に流す候補名も、選択時間以内でできる家事だけに絞る(実際には選ばれない家事を見せて誤解させないため)。
  const eligibleTaskNames = filterTasksWithinTime(tasks, timeUpperBound).map((t) => t.name);

  const handleSpinFinish = useCallback(() => {
    setStep("result");
  }, []);

  const handleRespin = () => {
    const result = selectHousework({
      tasks: rouletteTasks,
      selectedMinutes: timeUpperBound,
      condition,
      recentTaskIdsDesc,
      excludeTaskId: currentTaskId ?? undefined,
    });
    setCurrentTaskId(result.taskId);
    setStep("spinning");
  };

  const handleStartTimer = () => setStep("timer");

  const handleTimerComplete = async (elapsedSeconds: number) => {
    // 履歴には目安時間ではなく、ユーザーが実際にかけた時間を記録する。
    const actualMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    if (currentTask) {
      const result = await completeHousework({
        taskId: currentTask.id,
        taskName: currentTask.name,
        durationMin: actualMinutes,
      });
      if (result.ok) {
        setTodaysHistory((prev) => [
          { id: result.data.id, taskName: currentTask.name, durationMin: actualMinutes, completedAt: new Date() },
          ...prev,
        ]);
      }
    }
    setCompletedMinutes(actualMinutes);
    setStep("complete");
  };

  const handleCancelTimer = () => router.push("/home");

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p>まだ家事が登録されていません。家事リストから追加してください。</p>
        <Button onClick={() => router.push("/tasks")}>家事リストへ</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      {step === "spinning" && (
        <RouletteReel candidateNames={eligibleTaskNames} onFinish={handleSpinFinish} />
      )}

      {step === "result" && currentTask && (
        <ResultCard
          taskName={currentTask.name}
          durationMin={currentTask.durationMin}
          onStart={handleStartTimer}
          onRespin={handleRespin}
        />
      )}

      {step === "timer" && currentTask && (
        <TaskTimer
          taskName={currentTask.name}
          durationMin={currentTask.durationMin}
          onComplete={handleTimerComplete}
          onCancel={handleCancelTimer}
        />
      )}

      {step === "complete" && currentTask && (
        <div className="flex flex-col items-center gap-6 pt-10 text-center">
          <p className="text-5xl" aria-hidden>
            🎉
          </p>
          <h1 className="text-2xl font-bold">おつかれさまでした！</h1>
          <p className="text-muted-foreground">
            「{currentTask.name}」を完了しました(所要時間 約{completedMinutes ?? currentTask.durationMin}分)
          </p>

          <AchievementBadge achievedCount={todaysHistory.length} />

          <Button size="lg" className="h-12 w-full" onClick={() => router.push("/home")}>
            ホームへ戻る
          </Button>

          <TodaysHistoryList items={todaysHistory} />
        </div>
      )}
    </div>
  );
}
