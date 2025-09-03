import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ProjectSelector } from '@/components/dashboard/ProjectSelector';
import { TaskModal } from '@/components/dashboard/TaskModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { Plus, BarChart3, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const { toast } = useToast();
  
  const tasks = useTaskStore((state) => state.tasks);
  const projects = useTaskStore((state) => state.projects);
  const selectedProject = useTaskStore((state) => state.selectedProject);
  const isLoading = useTaskStore((state) => state.isLoading);
  const error = useTaskStore((state) => state.error);
  const fetchProjects = useTaskStore((state) => state.fetchProjects);
  const clearError = useTaskStore((state) => state.clearError);
  
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

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleCreateTask = () => {
    if (!selectedProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project before creating a task",
        variant: "destructive",
      });
      return;
    }
    setTaskModalOpen(true);
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        <Header />
        <main className="container py-6 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </main>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        <Header />
        <main className="container py-6 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Welcome, {user?.name}!
            </h2>
            <p className="text-muted-foreground">
              Get started by creating your first project
            </p>
          </div>
          
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-6xl">📋</div>
                <h3 className="text-xl font-semibold">No Projects Yet</h3>
                <p className="text-muted-foreground">
                  Create your first project to start organizing tasks
                </p>
                <Button
                  onClick={() => fetchProjects()}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
            onClick={handleCreateTask}
            className="bg-gradient-primary hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            New Task
          </Button>
        </div>

        {/* Kanban Board */}
        {selectedProject ? (
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>
                {selectedProject.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <KanbanBoard />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-4xl">🎯</div>
                <h3 className="text-lg font-semibold">Select a Project</h3>
                <p className="text-muted-foreground">
                  Choose a project from the dropdown above to view and manage tasks
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <TaskModal open={taskModalOpen} onOpenChange={setTaskModalOpen} />
    </div>
  );
}