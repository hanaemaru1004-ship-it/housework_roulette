"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConditionSelector } from "@/components/roulette/ConditionSelector";
import { TimeSelector } from "@/components/roulette/TimeSelector";
import { Button } from "@/components/ui/button";
import type { ConditionOption, TimeOption } from "@/lib/validation";

export default function HomePage() {
  const router = useRouter();
  const [minutes, setMinutes] = useState<TimeOption | null>(null);
  const [condition, setCondition] = useState<ConditionOption | null>(null);

  const canStart = minutes !== null && condition !== null;

  const handleStart = () => {
    if (!canStart) return;
    router.push(`/play?minutes=${minutes}&condition=${condition}`);
  };

  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-4 pt-10">
      <header className="text-center">
        <p className="text-sm text-muted-foreground">今日の家事、決めるのはルーレット🎲</p>
        <h1 className="mt-1 text-2xl font-bold">家事ルーレット</h1>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">使える時間</h2>
        <TimeSelector value={minutes} onChange={setMinutes} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">今日のコンディション</h2>
        <ConditionSelector value={condition} onChange={setCondition} />
      </section>

      <Button size="lg" className="h-14 text-base font-bold" disabled={!canStart} onClick={handleStart}>
        🎲 家事ルーレットを回す
      </Button>
    </main>
  );
}
