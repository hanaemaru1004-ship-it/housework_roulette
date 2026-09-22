"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TIME_OPTIONS, type TimeOption } from "@/lib/validation";

const TIME_LABELS: Record<TimeOption, string> = {
  5: "5分",
  10: "10分",
  15: "15分",
  30: "30分",
  60: "1時間以上",
};

type Props = {
  value: TimeOption | null;
  onChange: (value: TimeOption) => void;
};

export function TimeSelector({ value, onChange }: Props) {
  return (
    <ToggleGroup
      value={value ? [String(value)] : []}
      onValueChange={(groupValue) => {
        const next = groupValue[0];
        if (next) onChange(Number(next) as TimeOption);
      }}
      className="grid grid-cols-3 gap-2 sm:grid-cols-5"
    >
      {TIME_OPTIONS.map((minutes) => (
        <ToggleGroupItem
          key={minutes}
          value={String(minutes)}
          aria-label={TIME_LABELS[minutes]}
          className="h-12 rounded-xl border border-border bg-card text-sm font-semibold aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        >
          {TIME_LABELS[minutes]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
