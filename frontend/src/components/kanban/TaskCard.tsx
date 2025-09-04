import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isUpdating?: boolean;
}

export function TaskCard({ task, isDragging, isUpdating }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  // Safely get assignee initials
  const getAssigneeInitials = () => {
    if (!task.assigneeId) return '?';
    if (Array.isArray(task.assigneeId)) {
      return task.assigneeId[0] || '?';
    }
    if (typeof task.assigneeId === 'string') {
      return task.assigneeId[0] || '?';
    }
    return '?';
  };

  // Safely format deadline
  const formatDeadline = (deadline: any) => {
    if (!deadline) return null;
    try {
      const date = new Date(deadline);
      if (isNaN(date.getTime())) return null;
      return format(date, 'MMM d');
    } catch {
      return null;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-4 cursor-move hover:shadow-card transition-all relative",
        (isDragging || isSortableDragging) && "opacity-50 rotate-3 scale-105",
        isUpdating && "opacity-75 ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Loading overlay when updating */}
      {isUpdating && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Updating...</span>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm text-foreground line-clamp-2">
            {task.title}
          </h4>
          <Badge className={cn("text-xs", priorityColors[task.priority || 'medium'])}>
            {task.priority || 'medium'}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {getAssigneeInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {task.deadline && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDeadline(task.deadline)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}