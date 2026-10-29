import { z } from "zod";

// 認証まわり
export const signupSchema = z.object({
  username: z
    .string()
    .min(3, { message: "ユーザー名は3文字以上で入力してください" })
    .max(30, { message: "ユーザー名は30文字以内で入力してください" })
    .regex(/^[A-Za-z0-9_.-]+$/, {
      message: "ユーザー名は半角英数字と _ . - のみ使えます",
    }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上で入力してください" }),
  name: z.string().max(50).optional().or(z.literal("")),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, { message: "ユーザー名は3文字以上で入力してください" })
    .max(30, { message: "ユーザー名は30文字以内で入力してください" })
    .regex(/^[A-Za-z0-9_.-]+$/, {
      message: "ユーザー名は半角英数字と _ . - のみ使えます",
    }),
  password: z.string().min(1, { message: "パスワードを入力してください" }),
});
export type LoginInput = z.infer<typeof loginSchema>;

// 家事CRUD
export const houseworkTaskInputSchema = z.object({
  name: z.string().min(1, { message: "家事名を入力してください" }).max(50),
  durationMin: z
    .number({ message: "所要時間を入力してください" })
    .int()
    .min(1, { message: "所要時間は1分以上にしてください" })
    .max(999),
  difficulty: z
    .number({ message: "難易度を選択してください" })
    .int()
    .min(1)
    .max(5),
  category: z.string().max(30).optional().or(z.literal("")),
  description: z.string().max(300).optional().or(z.literal("")),
});
export type HouseworkTaskInput = z.infer<typeof houseworkTaskInputSchema>;

// ルーレットの選択肢
export const TIME_OPTIONS = [5, 10, 15, 30, 60] as const;
export type TimeOption = (typeof TIME_OPTIONS)[number];

/**
 * 選択された時間区分を、ルーレット抽選で使う「所要時間の上限」に変換する。
 * 最大区分(60=「1時間以上」)は「60分ちょうどまで」ではなく上限なしを意味するため、
 * その場合はInfinityを返し、60分を超える家事(ユーザーが追加した長時間の家事)も候補に含める。
 */
export function resolveTimeUpperBound(selectedMinutes: number): number {
  const max = TIME_OPTIONS[TIME_OPTIONS.length - 1];
  return selectedMinutes >= max ? Infinity : selectedMinutes;
}

export const CONDITION_OPTIONS = [
  { value: "energetic", label: "元気", emoji: "😄" },
  { value: "normal", label: "普通", emoji: "🙂" },
  { value: "tired", label: "ちょっと疲れた", emoji: "😐" },
  { value: "exhausted", label: "かなり疲れた", emoji: "😴" },
] as const;
export type ConditionOption = (typeof CONDITION_OPTIONS)[number]["value"];
