import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatDateHeading(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function HistoryPage() {
  const session = await auth();
  const userId = session!.user.id;

  const histories = await prisma.historyEntry.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    select: { id: true, taskName: true, durationMin: true, completedAt: true },
  });

  // 日付ごとにグルーピングする(completedAtの降順を維持したまま日付単位でまとめる)。
  const groups = new Map<string, typeof histories>();
  for (const entry of histories) {
    const key = dateKey(entry.completedAt);
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 pt-10">
      <h1 className="text-2xl font-bold">履歴</h1>

      {histories.length === 0 ? (
        <p className="pt-10 text-center text-muted-foreground">
          まだ完了した家事がありません。ルーレットを回して家事をこなしましょう！
        </p>
      ) : (
        Array.from(groups.entries()).map(([key, entries]) => (
          <section key={key} className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {formatDateHeading(entries[0].completedAt)}
            </h2>
            <div className="space-y-2">
              {entries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{entry.taskName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(entry.completedAt)}
                      </p>
                    </div>
                    <Badge variant="secondary">⏱ {entry.durationMin}分</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
