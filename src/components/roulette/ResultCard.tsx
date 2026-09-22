"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  taskName: string;
  durationMin: number;
  onStart: () => void;
  onRespin: () => void;
};

export function ResultCard({ taskName, durationMin, onStart, onRespin }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6"
    >
      <Card className="items-center py-8 text-center">
        <CardContent className="flex flex-col items-center gap-2" role="status" aria-live="polite">
          <p className="text-sm text-muted-foreground">今日の家事は……</p>
          <p className="text-3xl font-extrabold">{taskName}</p>
          <p className="text-lg text-muted-foreground">⏱ 約{durationMin}分</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Button size="lg" className="h-14 text-base font-bold" onClick={onStart}>
          これをやる
        </Button>
        <Button size="lg" variant="outline" className="h-12" onClick={onRespin}>
          もう一度回す
        </Button>
      </div>
    </motion.div>
  );
}
