import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

export function KanbanColumn({ id, title, color, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-card rounded-lg border border-border/50 transition-all",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className={cn(
            "inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full",
            color,
            "text-white"
          )}>
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}