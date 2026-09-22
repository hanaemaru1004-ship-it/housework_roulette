"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export type TodaysHistoryItem = {
  id: string;
  taskName: string;
  durationMin: number;
  completedAt: Date;
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

type Props = {
  items: TodaysHistoryItem[];
};

// 完了画面の下に表示する「今日やったこと」一覧。
export function TodaysHistoryList({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="w-full space-y-2 text-left">
      <h2 className="text-sm font-semibold text-muted-foreground">今日やったこと</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{item.taskName}</p>
                <p className="text-xs text-muted-foreground">{formatTime(item.completedAt)}</p>
              </div>
              <Badge variant="secondary">⏱ {item.durationMin}分</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
