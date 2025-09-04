import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ProjectSelector } from '@/components/dashboard/ProjectSelector';
import { TaskModal } from '@/components/dashboard/TaskModal';
import { ColumnModal } from '@/components/dashboard/ColumnModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjects } from '@/hooks';
import { useCurrentUser } from '@/hooks/useAuth';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

export default function Dashboard() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const { toast } = useToast();
  
  const { projects } = useProjects();
  const { data: userData } = useCurrentUser();
  

  const user = userData?.data;
  const projectsData = Array.isArray(projects.data?.data) ? projects.data.data : [];


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
      <div className="h-screen bg-gradient-to-br from-background via-background to-accent/10 flex flex-col">
        <Header />
        <main className="container py-6 flex-1 flex items-center justify-center">
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
      <div className="h-screen bg-gradient-to-br from-background via-background to-accent/10 flex flex-col">
        <Header />
        <main className="container py-6 space-y-6 flex-1 flex flex-col">
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
    <div className="h-screen bg-gradient-to-br from-background via-background to-accent/10 flex flex-col">
      <Header />
      
      <main className="container py-6 space-y-6 flex-1 flex flex-col">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your projects and tasks
          </p>
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
          <Card className="bg-gradient-card border-border/50 flex-1 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>
                {selectedProject.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <KanbanBoard projectId={selectedProject.id} />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-card border-border/50 flex-1 flex flex-col">
            <CardContent className="pt-6 flex-1 flex items-center justify-center">
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