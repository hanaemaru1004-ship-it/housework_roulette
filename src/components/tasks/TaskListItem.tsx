"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HouseworkTaskListItem } from "@/lib/actions/tasks";

type Props = {
  task: HouseworkTaskListItem;
  onEdit: (task: HouseworkTaskListItem) => void;
  onDelete: (task: HouseworkTaskListItem) => void;
};

export function TaskListItem({ task, onEdit, onDelete }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{task.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Badge variant="secondary">⏱ {task.durationMin}分</Badge>
            <Badge variant="secondary">難易度 {task.difficulty}</Badge>
            {task.category && <Badge variant="secondary">{task.category}</Badge>}
          </div>
          {task.description && (
            <p className="mt-1.5 truncate text-sm text-muted-foreground">{task.description}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="メニューを開く"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
              >
                <MoreVertical className="size-5" />
              </button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="size-4" />
              編集
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(task)}>
              <Trash2 className="size-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
