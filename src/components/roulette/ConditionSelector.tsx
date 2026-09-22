"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CONDITION_OPTIONS, type ConditionOption } from "@/lib/validation";

type Props = {
  value: ConditionOption | null;
  onChange: (value: ConditionOption) => void;
};

export function ConditionSelector({ value, onChange }: Props) {
  return (
    <ToggleGroup
      value={value ? [value] : []}
      onValueChange={(groupValue) => {
        const next = groupValue[0];
        if (next) onChange(next as ConditionOption);
      }}
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {CONDITION_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card text-xs font-semibold aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        >
          <span className="text-2xl" aria-hidden>
            {option.emoji}
          </span>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
