"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

type Props = {
  candidateNames: readonly string[];
  onFinish: () => void;
  durationMs?: number;
};

// 円盤が回転するルーレット演出。
// 回転そのものは装飾であり、実際の抽選結果は選択時間内の候補からのみ決まる(見た目には影響しない)。
export function RouletteReel({ candidateNames, onFinish, durationMs = 1800 }: Props) {
  const [displayName, setDisplayName] = useState(candidateNames[0] ?? "");

  // 最低6周+ランダムな端数だけ回してから止まるようにする(毎回同じ止まり方に見えないように)。
  const [totalRotation] = useState(() => 360 * 6 + Math.floor(Math.random() * 360));

  useEffect(() => {
    if (candidateNames.length === 0) {
      onFinish();
      return;
    }

    let intervalMs = 60;
    let elapsed = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      setDisplayName(candidateNames[Math.floor(Math.random() * candidateNames.length)]);
      elapsed += intervalMs;
      // 終盤に向けて切り替え間隔を少しずつ伸ばし、減速している感じを出す。
      intervalMs = Math.min(intervalMs + 12, 220);
      if (elapsed >= durationMs) {
        onFinish();
        return;
      }
      timeoutId = setTimeout(tick, intervalMs);
    };

    timeoutId = setTimeout(tick, intervalMs);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-72 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card">
      <div className="relative flex items-center justify-center">
        {/* 上部の固定ポインター(円盤だけが回転する) */}
        <div
          className="absolute -top-1 left-1/2 z-10 size-0 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-primary"
          aria-hidden
        />
        <motion.div
          className="size-40 rounded-full ring-4 ring-card"
          style={{
            background:
              "conic-gradient(var(--color-primary) 0deg 45deg, var(--color-secondary) 45deg 90deg, var(--color-accent) 90deg 135deg, var(--color-muted) 135deg 180deg, var(--color-primary) 180deg 225deg, var(--color-secondary) 225deg 270deg, var(--color-accent) 270deg 315deg, var(--color-muted) 315deg 360deg)",
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: totalRotation }}
          transition={{ duration: durationMs / 1000, ease: [0.1, 0.75, 0.2, 1] }}
          aria-hidden
        >
          <div className="flex size-full items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-card text-2xl shadow-sm">
              🎯
            </span>
          </div>
        </motion.div>
      </div>

      {/* 高速で切り替わる演出はスクリーンリーダーには読み上げさせず、結果確定後にResultCard側で1回だけ通知する。 */}
      <motion.p
        key={displayName}
        initial={{ opacity: 0.3, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.08 }}
        className="text-xl font-bold"
        aria-hidden
      >
        {displayName}
      </motion.p>
      <p className="sr-only" role="status">
        家事を抽選しています…
      </p>
    </div>
  );
}
