import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'

export const useColumns = (projectId: string) => {
  const queryClient = useQueryClient()

  const columns = useQuery({
    queryKey: ['columns', projectId],
    queryFn: async () => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      const result = await apiService.getColumns(projectId);
      // The columns endpoint returns an array directly, not wrapped in data
      // So we need to wrap it to match the expected structure
      return { data: result.data || result };
    },
    enabled: !!projectId && projectId.trim() !== '',
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a validation error
      if (error.message === 'Project ID is required') {
        return false;
      }
      return failureCount < 3;
    },
  })

  const createColumn = useMutation({
    mutationFn: ({ name, order }: { name: string; order?: number }) => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      return apiService.createColumn(projectId, name, order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] })
    },
  })

  const updateColumn = useMutation({
    mutationFn: ({ columnId, updates }: { columnId: string; updates: { name?: string; order?: number } }) => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      return apiService.updateColumn(projectId, columnId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] })
    },
  })

  const deleteColumn = useMutation({
    mutationFn: (columnId: string) => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      return apiService.deleteColumn(projectId, columnId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] })
    },
  })

  const fixColumnOrder = useMutation({
    mutationFn: () => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      return apiService.fixColumnOrder(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] })
    },
  })

  const reorderColumns = useMutation({
    mutationFn: (columns: { id: string; order: number }[]) => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      return apiService.reorderColumns(projectId, columns);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] })
    },
  })

  return {
    columns,
    createColumn,
    updateColumn,
    deleteColumn,
    fixColumnOrder,
    reorderColumns,
  }
}
