import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  updatingTaskId?: string | null;
}

export function KanbanColumn({ id, title, color, tasks, updatingTaskId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'column',
      accepts: ['task']
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-card rounded-lg border border-border/50 transition-all min-w-[320px] max-w-[320px] flex-shrink-0",
        isOver && "ring-2 ring-primary ring-offset-2 bg-primary/5 border-primary/50"
      )}
    >
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          <span className={cn(
            "inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full flex-shrink-0",
            color,
            "text-white"
          )}>
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            isUpdating={updatingTaskId === task.id}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks
          </div>
        )}
        {/* Ensure there's always a drop zone area */}
        <div className="min-h-[20px] w-full" />
      </div>
    </div>
  );
}