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
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-kanban-todo' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-kanban-progress' },
  { id: 'done', title: 'Done', color: 'bg-kanban-done' },
] as const;

export function KanbanBoard() {
  const tasks = useTaskStore((state) => state.tasks);
  const selectedProject = useTaskStore((state) => state.selectedProject);
  const moveTask = useTaskStore((state) => state.moveTask);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const projectTasks = selectedProject
    ? tasks.filter((task) => task.projectId === selectedProject.id)
    : tasks;

  const handleDragStart = (event: DragStartEvent) => {
    const task = projectTasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as Task['status'];
    
    if (columns.some(col => col.id === newStatus)) {
      moveTask(taskId, newStatus);
    }
    
    setActiveTask(null);
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {columns.map((column) => {
          const columnTasks = projectTasks.filter(
            (task) => task.status === column.id
          );

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