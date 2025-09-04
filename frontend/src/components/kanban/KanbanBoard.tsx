import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTasks, useColumns } from '@/hooks';
import { Task } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  projectId: string;
}



export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks } = useTasks(projectId);
  const { columns: columnsQuery } = useColumns(projectId);
  const { updateTask } = useTasks(projectId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Helper function to get column color based on name
  const getColumnColor = (columnName: string): string => {
    const name = columnName.toLowerCase();
    if (name.includes('todo') || name.includes('to do')) {
      return 'bg-kanban-todo';
    } else if (name.includes('progress') || name.includes('doing')) {
      return 'bg-kanban-progress';
    } else if (name.includes('done') || name.includes('complete')) {
      return 'bg-kanban-done';
    } else if (name.includes('review') || name.includes('testing')) {
      return 'bg-blue-500';
    } else if (name.includes('blocked') || name.includes('waiting')) {
      return 'bg-red-500';
    } else {
      return 'bg-gray-500'; // Default color
    }
  };

  // Helper function to get the status value for a column title
  const getColumnStatus = (columnTitle: string): string => {
    const name = columnTitle.toLowerCase();
    if (name.includes('todo') || name.includes('to do') || name.includes('backlog')) {
      return 'todo';
    } else if (name.includes('progress') || name.includes('doing') || name.includes('in progress') || name.includes('review') || name.includes('testing')) {
      return 'in-progress';
    } else if (name.includes('done') || name.includes('complete') || name.includes('finished')) {
      return 'done';
    } else {
      return 'todo'; // Default status
    }
  };

  // Early return if data is not ready
  if (!tasks.data?.data || !columnsQuery.data?.data) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading board...</p>
      </div>
    );
  }

  // Type guard to ensure data is an array
  const projectTasks = Array.isArray(tasks.data.data) ? tasks.data.data : [];
  const rawColumns = Array.isArray(columnsQuery.data.data) ? columnsQuery.data.data : [];

  // Map backend column structure to frontend expected structure
  const mappedColumns = rawColumns.map((col: any) => ({
    id: col.id,
    title: col.name, // Backend uses 'name', frontend expects 'title'
    color: getColumnColor(col.name), // Generate color based on name
    order: col.order
  }));

  // Debug logging for data
  console.log('KanbanBoard - projectTasks:', projectTasks);
  console.log('KanbanBoard - rawColumns:', rawColumns);
  console.log('KanbanBoard - mapped columns:', mappedColumns);
  
  // Debug task structure
  if (projectTasks.length > 0) {
    console.log('KanbanBoard - Sample task structure:', projectTasks[0]);
    console.log('KanbanBoard - All task statuses:', projectTasks.map(t => ({ id: t.id, status: t.status, title: t.title })));
  }

  // If no columns, show empty state
  if (mappedColumns.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold mb-2">No Columns Configured</h3>
        <p className="text-muted-foreground mb-4">
          This project doesn't have any columns yet. Create your first column to get started!
        </p>
        <p className="text-sm text-muted-foreground">
          Use the "New Column" button above to add columns to your project.
        </p>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = projectTasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newColumnId = over.id as string;
    
    console.log('handleDragEnd - Task moved:', {
      taskId,
      fromColumn: activeTask?.status,
      toColumn: newColumnId,
      allColumns: mappedColumns.map(col => ({ id: col.id, title: col.title }))
    });
    
    // Find the task being moved
    const movedTask = projectTasks.find(t => t.id === taskId);
    if (!movedTask) {
      console.error('handleDragEnd - Task not found:', taskId);
      return;
    }
    
    // Check if the new column is valid
    const targetColumn = mappedColumns.find(col => col.id === newColumnId);
    if (!targetColumn) {
      console.error('handleDragEnd - Invalid target column:', newColumnId);
      return;
    }
    
    // Map column to the correct status value
    const newStatus = getColumnStatus(targetColumn.title);
    
    console.log('handleDragEnd - Status mapping:', {
      columnId: newColumnId,
      columnTitle: targetColumn.title,
      mappedStatus: newStatus,
      currentTaskStatus: movedTask.status
    });
    
    // Only update if the status actually changed
    if (movedTask.status !== newStatus) {
      console.log('handleDragEnd - Updating task status:', {
        taskId,
        oldStatus: movedTask.status,
        newStatus: newStatus,
        columnTitle: targetColumn.title
      });
      
      try {
        // Update the task status with the mapped status value
        await updateTask.mutateAsync({ 
          taskId, 
          updates: { status: newStatus } 
        });
        
        console.log('handleDragEnd - Task status updated successfully');
        
        // Show success toast
        toast({
          title: "Task Moved",
          description: `"${movedTask.title}" moved to ${targetColumn.title}`,
        });
        
        // Force a refresh of the tasks data
        // This will trigger a re-render with the updated task positions
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        
      } catch (error) {
        console.error('handleDragEnd - Failed to update task status:', error);
        
        // Show error toast
        toast({
          title: "Error",
          description: "Failed to update task status. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      console.log('handleDragEnd - Task already in correct column, no update needed');
    }
    
    setActiveTask(null);
  };

  if (tasks.isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex overflow-x-auto gap-6 p-6 pb-4 pr-8 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50">
        {mappedColumns.map((column) => {
          // Get the status value for this column
          const columnStatus = getColumnStatus(column.title);
          
          // Filter tasks by the mapped status value
          let columnTasks = projectTasks.filter(
            (task) => task.status === columnStatus
          );

          // If no exact match, try matching by column name similarity
          if (columnTasks.length === 0) {
            const columnNameLower = column.title.toLowerCase();
            columnTasks = projectTasks.filter((task) => {
              const taskStatus = String(task.status || '').toLowerCase();
              
              // Try different matching strategies
              if (taskStatus === columnNameLower) return true;
              if (columnNameLower.includes(taskStatus)) return true;
              if (taskStatus.includes(columnNameLower)) return true;
              
              // Handle common variations
              if (columnNameLower === 'to do' && (taskStatus === 'todo' || taskStatus === 'to-do')) return true;
              if (columnNameLower === 'in progress' && (taskStatus === 'in-progress' || taskStatus === 'inprogress' || taskStatus === 'doing')) return true;
              if (columnNameLower === 'done' && (taskStatus === 'completed' || taskStatus === 'finished' || taskStatus === 'complete')) return true;
              
              return false;
            });
          }

          // Debug logging for each column
          console.log(`Column ${column.id} (${column.title}):`, {
            columnId: column.id,
            columnTitle: column.title,
            columnStatus: columnStatus,
            totalTasks: projectTasks.length,
            matchingTasks: columnTasks.length,
            allTaskStatuses: projectTasks.map(t => ({ id: t.id, status: t.status, title: t.title })),
            matchedTasks: columnTasks.map(t => ({ id: t.id, status: t.status, title: t.title }))
          });

          return (
            <SortableContext
              key={column.id}
              items={columnTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={columnTasks}
                updatingTaskId={updateTask.isPending ? activeTask?.id : null}
              />
            </SortableContext>
          );
        })}
      </div>
      
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}