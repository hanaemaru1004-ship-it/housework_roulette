"use client";

import { Progress } from "@/components/ui/progress";
import { DAILY_GOAL } from "@/lib/dailyGoal";

type Props = {
  achievedCount: number;
};

// 完了画面に表示する「今日の達成度」表示(達成x/3)。
export function AchievementBadge({ achievedCount }: Props) {
  const percent = Math.min((achievedCount / DAILY_GOAL) * 100, 100);
  const isGoalReached = achievedCount >= DAILY_GOAL;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="text-muted-foreground">今日の達成度</span>
        <span className={isGoalReached ? "text-primary" : undefined}>
          達成 {achievedCount}/{DAILY_GOAL}
        </span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
