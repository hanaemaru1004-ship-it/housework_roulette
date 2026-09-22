"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { houseworkTaskInputSchema, type HouseworkTaskInput } from "@/lib/validation";

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "1: かなり楽",
  2: "2: 楽",
  3: "3: 普通",
  4: "4: 少し大変",
  5: "5: 大変",
};

type Props = {
  defaultValues?: HouseworkTaskInput;
  onSubmit: (input: HouseworkTaskInput) => Promise<{ ok: boolean; error?: string }>;
  onSuccess: () => void;
  submitLabel: string;
};

export function TaskForm({ defaultValues, onSubmit, onSuccess, submitLabel }: Props) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HouseworkTaskInput>({
    resolver: zodResolver(houseworkTaskInputSchema),
    defaultValues: defaultValues ?? {
      name: "",
      durationMin: 10,
      difficulty: 2,
      category: "",
      description: "",
    },
  });

  const difficulty = watch("difficulty");

  const submit = handleSubmit(async (data) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);
      if (!result.ok) {
        setFormError(result.error ?? "保存に失敗しました");
        return;
      }
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">家事名</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="durationMin">所要時間(分)</Label>
          <Input
            id="durationMin"
            type="number"
            min={1}
            {...register("durationMin", { valueAsNumber: true })}
          />
          {errors.durationMin && (
            <p className="text-sm text-destructive">{errors.durationMin.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">難易度</Label>
          <Select
            value={String(difficulty ?? 2)}
            onValueChange={(v) => setValue("difficulty", Number(v), { shouldValidate: true })}
          >
            <SelectTrigger id="difficulty" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {DIFFICULTY_LABELS[d]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">カテゴリ</Label>
        <Input id="category" placeholder="例: 掃除" {...register("category")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "保存中…" : submitLabel}
      </Button>
    </form>
  );
}
