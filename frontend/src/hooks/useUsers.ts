import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'

export const useUsers = () => {
  const queryClient = useQueryClient()

  const updateCurrentUser = useMutation({
    mutationFn: (updates: { name?: string; avatar?: string }) =>
      apiService.updateCurrentUser(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const deleteCurrentUser = useMutation({
    mutationFn: () => apiService.deleteCurrentUser(),
    onSuccess: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      queryClient.clear()
    },
  })

  const getUserProjects = useQuery({
    queryKey: ['user-projects'],
    queryFn: () => apiService.getUserProjects(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    updateCurrentUser,
    deleteCurrentUser,
    getUserProjects,
  }
}

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiService.getUser(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => apiService.searchUsers(query),
    enabled: query.length > 2, // Only search when query is longer than 2 characters
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export const useProjectUsers = (projectId: string) => {
  return useQuery({
    queryKey: ['project-users', projectId],
    queryFn: () => apiService.getProjectUsers(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
