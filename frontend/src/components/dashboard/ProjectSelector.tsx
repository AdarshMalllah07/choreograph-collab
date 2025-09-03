import { useTaskStore } from '@/store/taskStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Folder } from 'lucide-react';

export function ProjectSelector() {
  const projects = useTaskStore((state) => state.projects);
  const selectedProject = useTaskStore((state) => state.selectedProject);
  const selectProject = useTaskStore((state) => state.selectProject);

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Folder className="h-5 w-5 text-muted-foreground" />
        <Select
          value={selectedProject?.id}
          onValueChange={selectProject}
        >
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
      </div>
      <Button size="sm" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        New Project
      </Button>
    </div>
  );
}