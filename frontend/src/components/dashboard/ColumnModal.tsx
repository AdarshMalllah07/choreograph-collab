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
  const [nameError, setNameError] = useState('');
  
  const { toast } = useToast();
  const { createColumn, columns } = useColumns(projectId);

  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) {
      toast({
        title: "Column Name Required",
        description: "Please enter a column name",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate names on the client side
    const existingColumns = columns.data?.data || [];
    const isDuplicate = existingColumns.some(
      (col: any) => col.name.toLowerCase().trim() === newColumnName.toLowerCase().trim()
    );

    if (isDuplicate) {
      setNameError(`A column with the name "${newColumnName}" already exists in this project.`);
      return;
    }

    // Clear any previous errors
    setNameError('');

    try {
      await createColumn.mutateAsync({
        name: newColumnName.trim(),
      });

      toast({
        title: "Column Created",
        description: `Column "${newColumnName}" created successfully`,
      });
      
      onOpenChange(false);
      setNewColumnName('');
    } catch (error: any) {
      console.error('Failed to create column:', error);
      
      // Handle specific error types
      if (error?.response?.data?.error === 'DUPLICATE_NAME') {
        toast({
          title: "Column Name Already Exists",
          description: error.response.data.message || `A column with the name "${newColumnName}" already exists in this project.`,
          variant: "destructive",
        });
      } else if (error?.response?.data?.error === 'ORDER_CONFLICT') {
        toast({
          title: "Order Conflict",
          description: error.response.data.message || "The specified order is already taken.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to create column. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setNewColumnName('');
    setNameError('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewColumnName(e.target.value);
    // Clear error when user starts typing
    if (nameError) {
      setNameError('');
    }
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
              onChange={handleNameChange}
              disabled={createColumn.isPending}
              className={nameError ? 'border-red-300 focus:border-red-500' : ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newColumnName.trim() && !nameError) {
                  handleCreateColumn();
                }
              }}
            />
            {nameError && (
              <p className="text-sm text-red-600">{nameError}</p>
            )}
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
              disabled={createColumn.isPending || !newColumnName.trim() || !!nameError}
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
