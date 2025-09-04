import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ProjectSelector } from '@/components/dashboard/ProjectSelector';
import { TaskModal } from '@/components/dashboard/TaskModal';
import { ColumnModal } from '@/components/dashboard/ColumnModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjects, useTasks, useColumns } from '@/hooks';
import { useCurrentUser } from '@/hooks/useAuth';
import { Plus, BarChart3, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

export default function Dashboard() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const { toast } = useToast();
  
  const { projects } = useProjects();
  const { data: userData } = useCurrentUser();
  
  // Only fetch tasks when a project is selected
  const { tasks } = useTasks(selectedProjectId || '');
  const { columns } = useColumns(selectedProjectId || '');

  const user = userData?.data;
  const projectTasks = Array.isArray(tasks.data?.data) ? tasks.data.data : [];
  const projectColumns = Array.isArray(columns.data?.data) ? columns.data.data : [];
  const projectsData = Array.isArray(projects.data?.data) ? projects.data.data : [];

  // Calculate stats dynamically based on actual columns
  const stats = {
    total: projectTasks.length,
    // Map each column to its task count
    ...Object.fromEntries(
      projectColumns.map(col => [
        col.name.toLowerCase().replace(/\s+/g, ''), // Convert "To Do" to "todo"
        projectTasks.filter(t => {
          const taskStatus = String(t.status || '').toLowerCase();
          const columnName = col.name.toLowerCase();
          
          // Try exact match first
          if (taskStatus === columnName) return true;
          
          // Handle common variations
          if (columnName === 'to do' && (taskStatus === 'todo' || taskStatus === 'to-do')) return true;
          if (columnName === 'in progress' && (taskStatus === 'in-progress' || taskStatus === 'inprogress' || taskStatus === 'doing')) return true;
          if (columnName === 'done' && (taskStatus === 'completed' || taskStatus === 'finished' || taskStatus === 'complete')) return true;
          
          return false;
        }).length
      ])
    )
  };

  // If no columns, only show total tasks
  const hasColumns = projectColumns.length > 0;



  // Helper functions for dynamic column stats
  const getColumnIconColor = (columnName: string): string => {
    const name = columnName.toLowerCase();
    if (name.includes('todo') || name.includes('to do')) return 'text-kanban-todo';
    if (name.includes('progress') || name.includes('doing')) return 'text-kanban-progress';
    if (name.includes('done') || name.includes('complete')) return 'text-kanban-done';
    return 'text-muted-foreground';
  };

  const getColumnIcon = (columnName: string) => {
    const name = columnName.toLowerCase();
    if (name.includes('todo') || name.includes('to do')) return AlertCircle;
    if (name.includes('progress') || name.includes('doing')) return Clock;
    if (name.includes('done') || name.includes('complete')) return CheckCircle;
    return BarChart3;
  };

  const getColumnDescription = (columnName: string): string => {
    const name = columnName.toLowerCase();
    if (name.includes('todo') || name.includes('to do')) return 'Tasks pending';
    if (name.includes('progress') || name.includes('doing')) return 'Currently working on';
    if (name.includes('done') || name.includes('complete')) return 'Tasks completed';
    return 'Tasks in this status';
  };

  const selectedProject = projectsData.find(p => p.id === selectedProjectId);

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

  // Auto-select first project if available and none selected
  React.useEffect(() => {
    if (projectsData.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projectsData[0].id);
    }
  }, [projectsData, selectedProjectId]);

  if (projects.isLoading && !projects.data) {
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

  if (!projectsData || projectsData.length === 0) {
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
                <ProjectSelector 
                  selectedProjectId={selectedProjectId}
                  onProjectSelect={setSelectedProjectId}
                />
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
          
          {hasColumns ? (
            // Render dynamic stats based on actual columns
            projectColumns.map((column, index) => {
              const columnKey = column.name.toLowerCase().replace(/\s+/g, '');
              const taskCount = stats[columnKey] || 0;
              const iconColor = getColumnIconColor(column.name);
              const Icon = getColumnIcon(column.name);
              const description = getColumnDescription(column.name);
              
              return (
                <Card key={column.id} className="bg-gradient-card border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{column.name}</CardTitle>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{taskCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            // Show message when no columns exist
            <>
              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">No Columns</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Create columns to organize tasks
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">No Columns</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Create columns to organize tasks
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">No Columns</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Create columns to organize tasks
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Project & Task Controls */}
        <div className="flex items-center justify-between">
          <ProjectSelector 
            selectedProjectId={selectedProjectId}
            onProjectSelect={setSelectedProjectId}
          />
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleCreateTask}
              className="bg-gradient-primary hover:opacity-90"
              disabled={!selectedProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <Button
              onClick={() => setColumnModalOpen(true)}
              variant="outline"
              disabled={!selectedProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Column
            </Button>
          </div>
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
              <KanbanBoard projectId={selectedProject.id} />
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

      <TaskModal open={taskModalOpen} onOpenChange={setTaskModalOpen} projectId={selectedProjectId} />
      {selectedProjectId && (
        <ColumnModal open={columnModalOpen} onOpenChange={setColumnModalOpen} projectId={selectedProjectId} />
      )}
    </div>
  );
}