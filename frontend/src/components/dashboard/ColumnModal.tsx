import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useColumns } from '@/hooks/useColumns';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function ColumnModal({ open, onOpenChange, projectId }: ColumnModalProps) {
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnOrder, setNewColumnOrder] = useState<number>(0);
  
  const { toast } = useToast();
  const { createColumn } = useColumns(projectId);

  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) {
      toast({
        title: "Column Name Required",
        description: "Please enter a column name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createColumn.mutateAsync({
        name: newColumnName.trim(),
        order: newColumnOrder,
      });

      toast({
        title: "Column Created",
        description: `Column "${newColumnName}" created successfully`,
      });
      
      onOpenChange(false);
      setNewColumnName('');
      setNewColumnOrder(0);
    } catch (error) {
      console.error('Failed to create column:', error);
      toast({
        title: "Error",
        description: "Failed to create column. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setNewColumnName('');
    setNewColumnOrder(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Column</DialogTitle>
          <DialogDescription>
            Add a new column to organize your project tasks
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="columnName">Column Name</Label>
            <Input
              id="columnName"
              placeholder="e.g., In Progress, Review, Testing"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              disabled={createColumn.isPending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newColumnName.trim()) {
                  handleCreateColumn();
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="columnOrder">Display Order (Optional)</Label>
            <Input
              id="columnOrder"
              type="number"
              placeholder="0"
              value={newColumnOrder}
              onChange={(e) => setNewColumnOrder(parseInt(e.target.value) || 0)}
              disabled={createColumn.isPending}
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first. Leave as 0 to add at the end.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={createColumn.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateColumn}
              disabled={createColumn.isPending || !newColumnName.trim()}
            >
              {createColumn.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Column
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
