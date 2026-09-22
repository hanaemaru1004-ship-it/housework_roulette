// 新規ユーザー作成時に登録する初期家事データ。
// サインアップ処理とシードスクリプトの両方から参照する単一の情報源（Single Source of Truth）。

export type DefaultHouseworkTask = {
  name: string;
  durationMin: number;
  difficulty: number;
  category: string;
};

export const DEFAULT_HOUSEWORK_TASKS: readonly DefaultHouseworkTask[] = [
  { name: "トイレ掃除", durationMin: 10, difficulty: 2, category: "掃除" },
  { name: "机の上を整理する", durationMin: 5, difficulty: 1, category: "整理整頓" },
  { name: "床に掃除機をかける", durationMin: 15, difficulty: 3, category: "掃除" },
  { name: "洗濯物を回す", durationMin: 5, difficulty: 1, category: "洗濯" },
  { name: "洗濯物を干す", durationMin: 10, difficulty: 2, category: "洗濯" },
  { name: "洗濯物をたたむ", durationMin: 10, difficulty: 2, category: "洗濯" },
  { name: "流しを掃除する", durationMin: 10, difficulty: 2, category: "掃除" },
  { name: "キッチンの棚を整理する", durationMin: 15, difficulty: 3, category: "整理整頓" },
  { name: "ゴミをまとめる", durationMin: 5, difficulty: 1, category: "掃除" },
  { name: "お風呂を掃除する", durationMin: 15, difficulty: 3, category: "掃除" },
];
