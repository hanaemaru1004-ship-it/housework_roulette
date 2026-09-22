import { describe, expect, it } from "vitest";
import {
  calcTaskWeight,
  conditionScore,
  filterTasksWithinTime,
  MIN_WEIGHT,
  pickWeightedRandom,
  recencyPenalty,
  selectHousework,
  type RouletteTask,
} from "@/lib/roulette";

describe("filterTasksWithinTime", () => {
  const tasks = [
    { id: "a", durationMin: 5 },
    { id: "b", durationMin: 10 },
    { id: "c", durationMin: 15 },
    { id: "d", durationMin: 30 },
  ];

  it("選択時間以内の家事だけに絞り込む", () => {
    const result = filterTasksWithinTime(tasks, 10);
    expect(result.map((t) => t.id).sort()).toEqual(["a", "b"]);
  });

  it("5分が選択された場合、所要時間5分の家事だけが候補になる(TASK.mdの例)", () => {
    const result = filterTasksWithinTime(tasks, 5);
    expect(result.map((t) => t.id)).toEqual(["a"]);
  });

  it("選択時間より長い家事は絶対に候補に含まれない", () => {
    const result = filterTasksWithinTime(tasks, 12);
    expect(result.some((t) => t.durationMin > 12)).toBe(false);
  });

  it("選択時間以内の家事が1件もない場合は、最も短い家事にフォールバックする", () => {
    const longOnly = [
      { id: "x", durationMin: 30 },
      { id: "y", durationMin: 60 },
      { id: "z", durationMin: 30 },
    ];
    const result = filterTasksWithinTime(longOnly, 5);
    expect(result.map((t) => t.id).sort()).toEqual(["x", "z"]);
  });
});

describe("conditionScore", () => {
  it("かなり疲れた場合は難易度1が最も出やすい", () => {
    const scores = [1, 2, 3, 4, 5].map((d) => conditionScore("exhausted", d));
    expect(scores[0]).toBe(Math.max(...scores));
  });

  it("元気な場合は難易度3〜5も高スコアになる", () => {
    const energetic3 = conditionScore("energetic", 3);
    const energetic5 = conditionScore("energetic", 5);
    const exhausted5 = conditionScore("exhausted", 5);
    expect(energetic3).toBeGreaterThanOrEqual(80);
    expect(energetic5).toBeGreaterThanOrEqual(80);
    expect(energetic5).toBeGreaterThan(exhausted5);
  });

  it("difficultyの範囲外の値はクランプされる", () => {
    expect(conditionScore("normal", 0)).toBe(conditionScore("normal", 1));
    expect(conditionScore("normal", 10)).toBe(conditionScore("normal", 5));
  });
});

describe("recencyPenalty", () => {
  it("履歴にない家事はペナルティなし(1)", () => {
    expect(recencyPenalty("task-1", [])).toBe(1);
  });

  it("直近であるほど強く減衰するが、0にはならない", () => {
    const recent = ["task-a", "task-b", "task-c", "task-d", "task-e"];
    const mostRecent = recencyPenalty("task-a", recent);
    const older = recencyPenalty("task-e", recent);
    expect(mostRecent).toBeLessThan(older);
    expect(mostRecent).toBeGreaterThan(0);
    expect(mostRecent).toBeGreaterThanOrEqual(0.5); // 最大でも50%減
  });

  it("ウィンドウ外の履歴は減衰しない", () => {
    const recent = ["a", "b", "c", "d", "e", "f"];
    expect(recencyPenalty("f", recent)).toBe(1);
  });
});

describe("calcTaskWeight", () => {
  it("スコアがどれだけ低くてもMIN_WEIGHT以上になる", () => {
    const weight = calcTaskWeight({ id: "t1", difficulty: 5 }, "exhausted", []);
    expect(weight).toBeGreaterThanOrEqual(MIN_WEIGHT);
  });
});

describe("pickWeightedRandom", () => {
  it("rngが0のとき最初の候補が選ばれる", () => {
    const candidates = [
      { taskId: "a", weight: 10 },
      { taskId: "b", weight: 90 },
    ];
    expect(pickWeightedRandom(candidates, () => 0)).toBe("a");
  });

  it("rngが1に近いとき最後の候補が選ばれる", () => {
    const candidates = [
      { taskId: "a", weight: 10 },
      { taskId: "b", weight: 90 },
    ];
    expect(pickWeightedRandom(candidates, () => 0.999999)).toBe("b");
  });

  it("大量試行で高スコアの候補ほど選ばれやすい(統計的傾向)", () => {
    const candidates = [
      { taskId: "high", weight: 90 },
      { taskId: "low", weight: 10 },
    ];
    let highCount = 0;
    const trials = 2000;
    for (let i = 0; i < trials; i++) {
      const picked = pickWeightedRandom(candidates, Math.random);
      if (picked === "high") highCount++;
    }
    const ratio = highCount / trials;
    expect(ratio).toBeGreaterThan(0.8);
    expect(ratio).toBeLessThan(0.98); // 低スコアも完全には0にならない
  });
});

describe("selectHousework", () => {
  const tasks: RouletteTask[] = [
    { id: "toilet", durationMin: 10, difficulty: 2 },
    { id: "desk", durationMin: 5, difficulty: 1 },
    { id: "vacuum", durationMin: 15, difficulty: 3 },
  ];

  it("選択時間以内の家事しか選ばれない", () => {
    for (let i = 0; i < 100; i++) {
      const result = selectHousework({
        tasks,
        selectedMinutes: 10,
        condition: "normal",
        rng: Math.random,
      });
      expect(result.taskId).not.toBe("vacuum"); // 15分は10分以内に収まらない
    }
  });

  it("5分を選択すると5分の家事だけが選ばれる(TASK.mdの例)", () => {
    for (let i = 0; i < 100; i++) {
      const result = selectHousework({
        tasks,
        selectedMinutes: 5,
        condition: "normal",
        rng: Math.random,
      });
      expect(result.taskId).toBe("desk");
    }
  });

  it("直前に出た家事は候補から除外され、連続して選ばれない", () => {
    for (let i = 0; i < 100; i++) {
      const result = selectHousework({
        tasks,
        selectedMinutes: 15,
        condition: "normal",
        excludeTaskId: "toilet",
        rng: Math.random,
      });
      expect(result.taskId).not.toBe("toilet");
    }
  });

  it("候補が1件しかない場合はexcludeTaskIdを無視して選ばれる", () => {
    const single: RouletteTask[] = [{ id: "only", durationMin: 10, difficulty: 2 }];
    const result = selectHousework({
      tasks: single,
      selectedMinutes: 10,
      condition: "normal",
      excludeTaskId: "only",
    });
    expect(result.taskId).toBe("only");
  });

  it("時間内に収まる家事が1つもない場合でも例外を投げず、最短の家事にフォールバックする", () => {
    const longOnly: RouletteTask[] = [
      { id: "bath", durationMin: 15, difficulty: 3 },
      { id: "shelf", durationMin: 15, difficulty: 3 },
    ];
    const result = selectHousework({
      tasks: longOnly,
      selectedMinutes: 5,
      condition: "normal",
    });
    expect(["bath", "shelf"]).toContain(result.taskId);
  });

  it("コンディションに合う難易度の家事ほど選ばれやすい(統計的傾向)", () => {
    let deskCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      const result = selectHousework({
        tasks,
        selectedMinutes: 15,
        condition: "exhausted", // 難易度1(desk)が最も出やすいはず
        rng: Math.random,
      });
      if (result.taskId === "desk") deskCount++;
    }
    expect(deskCount / trials).toBeGreaterThan(0.4);
  });
});
