import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'

export const useTasks = (projectId: string) => {
  const queryClient = useQueryClient()

  const tasks = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      return apiService.getTasks(projectId);
    },
    enabled: !!projectId && projectId.trim() !== '',
    staleTime: 1000 * 60 * 1, // 1 minute for tasks (more frequent updates)
    retry: (failureCount, error) => {
      // Don't retry if it's a validation error
      if (error.message === 'Project ID is required') {
        return false;
      }
      return failureCount < 3;
    },
  })

  const createTask = useMutation({
    mutationFn: (taskData: {
      title: string
      description?: string
      status?: string
      priority?: string
      assigneeId?: string
      order?: number
      deadline?: string
    }) => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      return apiService.createTask(projectId, taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const updateTask = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: any }) => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      return apiService.updateTask(projectId, taskId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const deleteTask = useMutation({
    mutationFn: (taskId: string) => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      return apiService.deleteTask(projectId, taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const assignTask = useMutation({
    mutationFn: ({ taskId, assigneeId }: { taskId: string; assigneeId: string }) => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      return apiService.assignTask(projectId, taskId, assigneeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const unassignTask = useMutation({
    mutationFn: (taskId: string) => {
      if (!projectId || projectId.trim() === '') {
        throw new Error('Project ID is required');
      }
      return apiService.unassignTask(projectId, taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  return {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    unassignTask,
  }
}

export const useTask = (projectId: string, taskId: string) => {
  return useQuery({
    queryKey: ['task', projectId, taskId],
    queryFn: () => {
      if (!projectId || projectId.trim() === '' || !taskId || taskId.trim() === '') {
        throw new Error('Project ID and Task ID are required');
      }
      return apiService.getTask(projectId, taskId);
    },
    enabled: !!projectId && projectId.trim() !== '' && !!taskId && taskId.trim() !== '',
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: (failureCount, error) => {
      // Don't retry if it's a validation error
      if (error.message === 'Project ID and Task ID are required') {
        return false;
      }
      return failureCount < 3;
    },
  })
}
