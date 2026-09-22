// 家事ルーレットの重み付き抽選ロジック。
// すべて副作用のない純粋関数として実装し、乱数生成器(rng)を注入できるようにすることで
// テストで決定的に検証できるようにしている。

export type Condition = "exhausted" | "tired" | "normal" | "energetic";

export type RouletteTask = {
  id: string;
  durationMin: number;
  difficulty: number; // 1〜5
};

// 総合スコアが極端に低い家事でも最低限これだけの当選重みを残す（完全に0にはしない）。
export const MIN_WEIGHT = 3;

// 直近何件の履歴を「出にくさ」の対象にするか。
export const RECENT_PENALTY_WINDOW = 5;

// 直近実施ペナルティの最大減衰率（直前に実施した家事でも最大50%減に留め、0にはしない）。
export const RECENT_PENALTY_FACTOR = 0.5;

// コンディション×難易度(1〜5)の相性スコア（0〜100）。
// TASK.mdの具体例（疲れているほど低難易度優遇、元気なら難易度3〜5も優遇）を
// そのままテーブル化している。
export const CONDITION_DIFFICULTY_SCORE: Record<
  Condition,
  readonly [number, number, number, number, number]
> = {
  exhausted: [100, 65, 30, 10, 3],
  tired: [85, 100, 55, 20, 6],
  normal: [55, 85, 100, 70, 35],
  energetic: [30, 55, 85, 100, 100],
};

/**
 * 選択時間以内でできる家事だけに絞り込む。
 * 例: 5分が選択された場合、所要時間5分の家事だけが候補になる(15分や30分の家事は選ばれない)。
 * 該当する家事が1件もない場合は、代わりに最も所要時間が短い家事群にフォールバックする
 * （何も選べず抽選が成立しない事態を避けるため）。
 */
export function filterTasksWithinTime<T extends Pick<RouletteTask, "durationMin">>(
  tasks: readonly T[],
  selectedMinutes: number,
): T[] {
  const withinTime = tasks.filter((t) => t.durationMin <= selectedMinutes);
  if (withinTime.length > 0) return withinTime;

  const minDuration = Math.min(...tasks.map((t) => t.durationMin));
  return tasks.filter((t) => t.durationMin === minDuration);
}

/** コンディションと家事の難易度の相性をスコア化する。 */
export function conditionScore(condition: Condition, difficulty: number): number {
  const table = CONDITION_DIFFICULTY_SCORE[condition];
  const index = Math.min(Math.max(difficulty, 1), 5) - 1;
  return table[index];
}

/**
 * 直近実施した家事ほど出にくくするための倍率(0〜1)を計算する。
 * 最新(idx=0)ほど強く減衰し、ウィンドウの外や対象外の家事は1（減衰なし）。
 */
export function recencyPenalty(taskId: string, recentTaskIdsDesc: readonly string[]): number {
  const idx = recentTaskIdsDesc.indexOf(taskId);
  if (idx === -1 || idx >= RECENT_PENALTY_WINDOW) return 1;
  const decay = (RECENT_PENALTY_WINDOW - idx) / RECENT_PENALTY_WINDOW;
  return 1 - RECENT_PENALTY_FACTOR * decay;
}

/** コンディションとの相性スコアに直近実施ペナルティと下限処理を適用し、抽選用の重みを求める。 */
export function calcTaskWeight(
  task: Pick<RouletteTask, "id" | "difficulty">,
  condition: Condition,
  recentTaskIdsDesc: readonly string[],
): number {
  const base = conditionScore(condition, task.difficulty);
  const weighted = base * recencyPenalty(task.id, recentTaskIdsDesc);
  return Math.max(weighted, MIN_WEIGHT);
}

export type Candidate = { taskId: string; weight: number };

/** 重み付きランダム抽選（累積和方式）。rngは0以上1未満の乱数を返す関数。 */
export function pickWeightedRandom(
  candidates: readonly Candidate[],
  rng: () => number = Math.random,
): string {
  if (candidates.length === 0) {
    throw new Error("抽選候補が空です");
  }
  const total = candidates.reduce((sum, c) => sum + c.weight, 0);
  let r = rng() * total;
  for (const c of candidates) {
    r -= c.weight;
    if (r <= 0) return c.taskId;
  }
  // 浮動小数点誤差により累積和がわずかに足りない場合のフォールバック。
  return candidates[candidates.length - 1].taskId;
}

export type SelectHouseworkParams = {
  tasks: readonly RouletteTask[];
  selectedMinutes: number;
  condition: Condition;
  recentTaskIdsDesc?: readonly string[];
  excludeTaskId?: string; // 直前に表示された家事（再抽選・連続回避用に除外する）
  rng?: () => number;
};

export type SelectHouseworkResult = {
  taskId: string;
  weight: number;
};

/**
 * 選択時間以内でできる家事に絞り込んだうえで、コンディションとの相性による重み付き抽選で1件選ぶ。
 * excludeTaskIdを指定すると、候補が2件以上ある場合に限りその家事を候補から除外する
 * （「もう一度回す」や連続回避に利用する）。
 */
export function selectHousework(params: SelectHouseworkParams): SelectHouseworkResult {
  const { tasks, selectedMinutes, condition, recentTaskIdsDesc = [], excludeTaskId, rng } = params;

  if (tasks.length === 0) {
    throw new Error("抽選対象の家事がありません");
  }

  const withinTime = filterTasksWithinTime(tasks, selectedMinutes);

  const pool =
    excludeTaskId !== undefined && withinTime.length > 1
      ? withinTime.filter((t) => t.id !== excludeTaskId)
      : withinTime;

  const candidates: Candidate[] = pool.map((t) => ({
    taskId: t.id,
    weight: calcTaskWeight(t, condition, recentTaskIdsDesc),
  }));

  const taskId = pickWeightedRandom(candidates, rng);
  const weight = candidates.find((c) => c.taskId === taskId)!.weight;
  return { taskId, weight };
}
