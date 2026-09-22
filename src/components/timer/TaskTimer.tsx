"use client";

import { useEffect, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { playAlarmSound } from "@/lib/alarm";

type Props = {
  taskName: string;
  durationMin: number;
  onComplete: (elapsedSeconds: number) => void;
  onCancel: () => void;
};

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TaskTimer({ taskName, durationMin, onComplete, onCancel }: Props) {
  const targetSeconds = durationMin * 60;
  // ストップウォッチ形式: 00:00から数え上げ、所要時間に達してもユーザーが完了を押すまで数え続ける。
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const hasAlarmedRef = useRef(false);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (elapsedSeconds < targetSeconds || hasAlarmedRef.current) return;
    hasAlarmedRef.current = true;
    playAlarmSound();
  }, [elapsedSeconds, targetSeconds]);

  const isOvertime = elapsedSeconds >= targetSeconds;
  const progressPercent = Math.min((elapsedSeconds / targetSeconds) * 100, 100);

  const handleStart = () => {
    setHasStarted(true);
    setIsRunning(true);
  };

  const handleComplete = () => {
    setIsRunning(false);
    onComplete(elapsedSeconds);
  };

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div>
        <p className="text-sm text-muted-foreground">実施中の家事</p>
        <p className="text-2xl font-bold">{taskName}</p>
        <p className="text-sm text-muted-foreground">所要時間の目安：約{durationMin}分</p>
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <p
          className="font-mono text-6xl font-extrabold tabular-nums data-[overtime=true]:text-primary"
          data-overtime={isOvertime}
          aria-live="polite"
        >
          {formatTime(elapsedSeconds)}
        </p>
        <Progress value={progressPercent} className="w-full" />
        {isOvertime && (
          <p className="text-sm font-semibold text-primary" role="status">
            ⏰ 時間になりました！完了したら「完了」を押してください
          </p>
        )}
      </div>

      <div className="flex w-full flex-col gap-3">
        {!hasStarted && (
          <Button size="lg" className="h-14 text-base font-bold" onClick={handleStart}>
            START
          </Button>
        )}
        {hasStarted && (
          <>
            <Button size="lg" className="h-14 text-base font-bold" onClick={handleComplete}>
              完了
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12"
              onClick={() => setIsRunning((prev) => !prev)}
            >
              {isRunning ? "一時停止" : "再開"}
            </Button>
          </>
        )}

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button size="lg" variant="ghost" className="h-12 text-muted-foreground">
                やっぱりやめる
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>家事をやめますか？</AlertDialogTitle>
              <AlertDialogDescription>
                タイマーを中止してホームに戻ります。この家事の履歴には記録されません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>続ける</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onCancel}>
                やめる
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
