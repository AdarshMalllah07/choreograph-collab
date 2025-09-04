import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'

export const useProjects = () => {
  const queryClient = useQueryClient()

  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  const createProject = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      apiService.createProject(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const updateProject = useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: { name?: string; description?: string } }) =>
      apiService.updateProject(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const deleteProject = useMutation({
    mutationFn: (projectId: string) => apiService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const addProjectMember = useMutation({
    mutationFn: ({ projectId, email }: { projectId: string; email: string }) =>
      apiService.addProjectMember(projectId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const removeProjectMember = useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
      apiService.removeProjectMember(projectId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
  }
}

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiService.getProject(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
