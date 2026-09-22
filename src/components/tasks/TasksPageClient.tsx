"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskListItem } from "@/components/tasks/TaskListItem";
import { createTask, deleteTask, updateTask, type HouseworkTaskListItem } from "@/lib/actions/tasks";
import type { HouseworkTaskInput } from "@/lib/validation";

type Props = {
  initialTasks: HouseworkTaskListItem[];
};

export function TasksPageClient({ initialTasks }: Props) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HouseworkTaskListItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<HouseworkTaskListItem | null>(null);

  const openCreateForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task: HouseworkTaskListItem) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSubmit = async (input: HouseworkTaskInput) => {
    const result = editingTask ? await updateTask(editingTask.id, input) : await createTask(input);
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    router.refresh();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    await deleteTask(deletingTask.id);
    setDeletingTask(null);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">家事リスト</h1>
        <Button size="sm" onClick={openCreateForm}>
          <Plus className="size-4" />
          家事を追加
        </Button>
      </div>

      {initialTasks.length === 0 ? (
        <p className="pt-10 text-center text-muted-foreground">
          まだ家事が登録されていません。「＋家事を追加」から登録してください。
        </p>
      ) : (
        <div className="space-y-2">
          {initialTasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              onEdit={openEditForm}
              onDelete={setDeletingTask}
            />
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "家事を編集" : "家事を追加"}</DialogTitle>
          </DialogHeader>
          <TaskForm
            key={editingTask?.id ?? "new"}
            defaultValues={
              editingTask
                ? {
                    name: editingTask.name,
                    durationMin: editingTask.durationMin,
                    difficulty: editingTask.difficulty,
                    category: editingTask.category ?? "",
                    description: editingTask.description ?? "",
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onSuccess={handleFormSuccess}
            submitLabel={editingTask ? "更新する" : "追加する"}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingTask !== null} onOpenChange={(open) => !open && setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>「{deletingTask?.name}」を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              削除してもこれまでの履歴は残りますが、ルーレットの候補からは外れます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
