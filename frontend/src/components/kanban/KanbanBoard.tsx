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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTasks, useColumns } from '@/hooks';
import { Task } from '@/types';
import { SortableColumn } from './SortableColumn';
import { TaskCard } from './TaskCard';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  projectId: string;
}



export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks } = useTasks(projectId);
  const { columns: columnsQuery, reorderColumns } = useColumns(projectId);
  const { updateTask } = useTasks(projectId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
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
    const name = columnTitle.toLowerCase().trim();
    
    // Exact matching with priority order to avoid conflicts
    // Check for exact matches first
    if (name === 'review' || name === 'testing' || name === 'qa') {
      return 'review';
    } else if (name === 'in progress' || name === 'progress' || name === 'doing' || name === 'working') {
      return 'in-progress';
    } else if (name === 'done' || name === 'completed' || name === 'finished' || name === 'complete') {
      return 'done';
    } else if (name === 'todo' || name === 'to do' || name === 'backlog') {
      return 'todo';
    } else {
      // For partial matches, be more specific to avoid conflicts
      if (name.includes('review') && !name.includes('progress')) {
        return 'review';
      } else if (name.includes('progress') && !name.includes('review')) {
        return 'in-progress';
      } else if (name.includes('done') || name.includes('complete')) {
        return 'done';
      } else if (name.includes('todo') || name.includes('backlog')) {
        return 'todo';
      } else {
        return 'todo'; // Default status
      }
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

  // Check for tasks that don't match any column status
  const allColumnStatuses = mappedColumns.map(col => getColumnStatus(col.title));
  const unmatchedTasks = projectTasks.filter(task => !allColumnStatuses.includes(task.status));
  if (unmatchedTasks.length > 0) {
    console.warn('KanbanBoard - Tasks with unmatched statuses:', {
      unmatchedTasks: unmatchedTasks.map(t => ({ id: t.id, status: t.status, title: t.title })),
      availableStatuses: allColumnStatuses,
      columnMappings: mappedColumns.map(col => ({ title: col.title, status: getColumnStatus(col.title) }))
    });
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
    const { active } = event;
    
    // Check if it's a task being dragged
    const task = projectTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
      return;
    }
    
    // Check if it's a column being dragged
    const column = mappedColumns.find((c) => c.id === active.id);
    if (column) {
      setActiveColumn(column.id);
      return;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Handle column reordering
    if (activeColumn && activeId === activeColumn) {
      const oldIndex = mappedColumns.findIndex(col => col.id === activeId);
      const newIndex = mappedColumns.findIndex(col => col.id === overId);
      
      if (oldIndex !== newIndex) {
        console.log('handleDragEnd - Column reordered:', {
          columnId: activeId,
          oldIndex,
          newIndex,
          columnTitle: mappedColumns[oldIndex]?.title
        });
        
        try {
          // Create new order array
          const newColumns = [...mappedColumns];
          const [movedColumn] = newColumns.splice(oldIndex, 1);
          newColumns.splice(newIndex, 0, movedColumn);
          
          // Update orders
          const reorderData = newColumns.map((col, index) => ({
            id: col.id,
            order: index
          }));
          
          await reorderColumns.mutateAsync(reorderData);
          
          console.log('handleDragEnd - Column reordered successfully');
          
          // Show success toast
          toast({
            title: "Column Reordered",
            description: `"${mappedColumns[oldIndex]?.title}" moved to position ${newIndex + 1}`,
          });
          
        } catch (error) {
          console.error('handleDragEnd - Failed to reorder column:', error);
          
          // Show error toast
          toast({
            title: "Error",
            description: "Failed to reorder column. Please try again.",
            variant: "destructive",
          });
        }
      }
      
      setActiveColumn(null);
      return;
    }
    
    // Handle task moving between columns
    const taskId = activeId;
    const newColumnId = overId;
    
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
      <SortableContext
        items={mappedColumns.map(col => col.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex overflow-x-auto gap-6 p-6 pb-4 pr-8 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50">
          {(() => {
            // Track which tasks have been assigned to columns to prevent duplicates
            const assignedTaskIds = new Set<string>();
            const columnData = mappedColumns.map((column) => {
              // Get the status value for this column
              const columnStatus = getColumnStatus(column.title);
              
              // Filter tasks by EXACT status match only, excluding already assigned tasks
              const columnTasks = projectTasks.filter(
                (task) => task.status === columnStatus && !assignedTaskIds.has(task.id)
              );

              // Mark these tasks as assigned
              columnTasks.forEach(task => assignedTaskIds.add(task.id));

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

              return {
                column,
                tasks: columnTasks
              };
            });

            // Check for any unassigned tasks
            const unassignedTasks = projectTasks.filter(task => !assignedTaskIds.has(task.id));
            if (unassignedTasks.length > 0) {
              console.warn('KanbanBoard - Unassigned tasks found:', {
                unassignedTasks: unassignedTasks.map(t => ({ id: t.id, status: t.status, title: t.title })),
                allColumns: mappedColumns.map(col => ({ title: col.title, status: getColumnStatus(col.title) }))
              });
            }

            return columnData.map(({ column, tasks }) => (
              <SortableContext
                key={column.id}
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <SortableColumn
                  id={column.id}
                  title={column.title}
                  color={column.color}
                  tasks={tasks}
                  updatingTaskId={updateTask.isPending ? activeTask?.id : null}
                />
              </SortableContext>
            ));
          })()}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        {activeColumn ? (
          <div className="opacity-50 rotate-3 scale-105">
            <SortableColumn
              id={activeColumn}
              title={mappedColumns.find(col => col.id === activeColumn)?.title || ''}
              color={mappedColumns.find(col => col.id === activeColumn)?.color || 'bg-gray-500'}
              tasks={[]}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}