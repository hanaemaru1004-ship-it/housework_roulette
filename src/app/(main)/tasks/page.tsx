import { TasksPageClient } from "@/components/tasks/TasksPageClient";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TasksPage() {
  const session = await auth();
  const userId = session!.user.id;

  const tasks = await prisma.houseworkTask.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      durationMin: true,
      difficulty: true,
      category: true,
      description: true,
    },
  });

  return <TasksPageClient initialTasks={tasks} />;
}
