import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanColumn } from './KanbanColumn';
import { Task } from '@/types';

interface SortableColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  updatingTaskId?: string | null;
}

export function SortableColumn({ id, title, color, tasks, updatingTaskId }: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <KanbanColumn
        id={id}
        title={title}
        color={color}
        tasks={tasks}
        updatingTaskId={updatingTaskId}
      />
    </div>
  );
}
