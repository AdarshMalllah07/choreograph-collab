import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useCurrentUser } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export function TaskModal({ open, onOpenChange, projectId }: TaskModalProps) {
  const { data: userData } = useCurrentUser();
  const { createTask } = useTasks(projectId || '');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deadline, setDeadline] = useState('');

  const user = userData?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId || !user) {
      toast.error('Please select a project');
      return;
    }

    // Validate required fields
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!priority) {
      toast.error('Task priority is required');
      return;
    }

    try {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        status: 'todo',
        priority,
        assigneeId: user.id,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });

      toast.success('Task created successfully');
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDeadline('');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to the project. Title and priority are required fields.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
                disabled={createTask.isPending}
                className={!title.trim() ? 'border-red-300 focus:border-red-500' : ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
                disabled={createTask.isPending}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority <span className="text-red-500">*</span></Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger 
                    disabled={createTask.isPending}
                    className={!priority ? 'border-red-300 focus:border-red-500' : ''}
                  >
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={createTask.isPending}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createTask.isPending}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-primary hover:opacity-90" 
              disabled={createTask.isPending || !title.trim() || !priority}
            >
              {createTask.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}