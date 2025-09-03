import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ProjectSelector } from '@/components/dashboard/ProjectSelector';
import { TaskModal } from '@/components/dashboard/TaskModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { Plus, BarChart3, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const tasks = useTaskStore((state) => state.tasks);
  const selectedProject = useTaskStore((state) => state.selectedProject);
  const user = useAuthStore((state) => state.user);

  const projectTasks = selectedProject
    ? tasks.filter((task) => task.projectId === selectedProject.id)
    : tasks;

  const stats = {
    total: projectTasks.length,
    todo: projectTasks.filter((t) => t.status === 'todo').length,
    inProgress: projectTasks.filter((t) => t.status === 'in-progress').length,
    done: projectTasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Header />
      
      <main className="container py-6 space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your projects and tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Across all statuses
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To Do</CardTitle>
              <AlertCircle className="h-4 w-4 text-kanban-todo" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todo}</div>
              <p className="text-xs text-muted-foreground">
                Tasks pending
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-kanban-progress" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Currently working on
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-kanban-done" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.done}</div>
              <p className="text-xs text-muted-foreground">
                Tasks completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Project & Task Controls */}
        <div className="flex items-center justify-between">
          <ProjectSelector />
          <Button
            onClick={() => setTaskModalOpen(true)}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Kanban Board */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>
              {selectedProject ? selectedProject.name : 'All Tasks'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <KanbanBoard />
          </CardContent>
        </Card>
      </main>

      <TaskModal open={taskModalOpen} onOpenChange={setTaskModalOpen} />
    </div>
  );
}