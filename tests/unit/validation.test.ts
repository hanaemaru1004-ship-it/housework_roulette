import { describe, expect, it } from "vitest";

import { resolveTimeUpperBound, TIME_OPTIONS } from "@/lib/validation";

describe("resolveTimeUpperBound", () => {
  it("最大区分(1時間以上)は上限なし(Infinity)に変換する", () => {
    const max = TIME_OPTIONS[TIME_OPTIONS.length - 1];
    expect(resolveTimeUpperBound(max)).toBe(Infinity);
  });

  it("最大区分以外はそのままの値を返す", () => {
    expect(resolveTimeUpperBound(5)).toBe(5);
    expect(resolveTimeUpperBound(30)).toBe(30);
  });
});
