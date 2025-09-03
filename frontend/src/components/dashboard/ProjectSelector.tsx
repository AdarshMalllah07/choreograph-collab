import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTaskStore } from '@/store/taskStore';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ProjectSelector() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  
  const projects = useTaskStore((state) => state.projects);
  const selectedProject = useTaskStore((state) => state.selectedProject);
  const selectProject = useTaskStore((state) => state.selectProject);
  const createProject = useTaskStore((state) => state.createProject);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const success = await createProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
      });

      if (success) {
        toast({
          title: "Project Created",
          description: `Project "${newProjectName}" created successfully`,
        });
        setIsCreateDialogOpen(false);
        setNewProjectName('');
        setNewProjectDescription('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    selectProject(projectId);
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedProject?.id} onValueChange={handleProjectSelect}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your tasks
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="Enter project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Description (Optional)</Label>
              <Textarea
                id="projectDescription"
                placeholder="Enter project description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                disabled={isCreating}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectName.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}