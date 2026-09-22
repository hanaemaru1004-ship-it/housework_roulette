// 所要時間に到達したことを知らせるアラーム音。
// 外部音声ファイルを使わず、Web Audio APIでビープ音を合成する。

export function playAlarmSound(): void {
  if (typeof window === "undefined") return;

  const AudioContextClass =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // 短いビープ音を3回鳴らす。
    [0, 0.3, 0.6].forEach((offset) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.3, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.25);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.3);
    });

    setTimeout(() => {
      ctx.close().catch(() => undefined);
    }, 1200);
  } catch {
    // AudioContextが使えない環境では何もしない(タイマー自体は継続する)。
  }
}
