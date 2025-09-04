import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'

// Type for the actual API response
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const useAuth = () => {
  const queryClient = useQueryClient()

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiService.login(email, password),
    onSuccess: (data) => {
      console.log('Login mutation onSuccess - Full response:', data);
      
      // Check if we have the expected response structure
      if (data.data && typeof data.data === 'object' && 'accessToken' in data.data) {
        const authData = data.data as AuthResponse;
        console.log('Login success - Storing tokens and user data:', authData);
        
        // Store the accessToken (not 'token')
        localStorage.setItem('token', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        
        // Store user data for immediate access
        localStorage.setItem('user', JSON.stringify(authData.user));
        
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        console.log('Login success - Tokens stored, user data cached');
      } else {
        console.error('Login response missing expected data structure:', data);
      }
    },
  })

  const signup = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      apiService.signup(name, email, password),
    onSuccess: (data) => {
      console.log('Signup mutation onSuccess - Full response:', data);
      
      // Check if we have the expected response structure
      if (data.data && typeof data.data === 'object' && 'accessToken' in data.data) {
        const authData = data.data as AuthResponse;
        console.log('Signup success - Storing tokens and user data:', authData);
        
        // Store the accessToken (not 'token')
        localStorage.setItem('token', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        
        // Store user data for immediate access
        localStorage.setItem('user', JSON.stringify(authData.user));
        
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        console.log('Signup success - Tokens stored, user data cached');
      } else {
        console.error('Signup response missing expected data structure:', data);
      }
    },
  })

  const logout = useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      console.log('Logout success - Clearing all data');
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      // Clear all queries from cache
      queryClient.clear()
    },
  })

  const refreshToken = useMutation({
    mutationFn: (refreshToken: string) => apiService.refreshToken(refreshToken),
    onSuccess: (data) => {
      console.log('Refresh token success:', data);
      // Backend only returns { accessToken }, not the full AuthResponse
      if (data.data && typeof data.data === 'object' && 'accessToken' in data.data) {
        const authData = data.data as { accessToken: string };
        localStorage.setItem('token', authData.accessToken);
        console.log('Access token updated from refresh');
        // Note: Backend doesn't return new refreshToken, so we keep the existing one
        // Note: Backend doesn't return user data, so we keep the existing cached user
      }
    },
  })

  const refetchUser = () => {
    console.log('Refetching user data...');
    return queryClient.invalidateQueries({ queryKey: ['user'] })
  }

  const manualRefreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      console.error('No refresh token available for manual refresh');
      return false;
    }
    
    try {
      await refreshToken.mutateAsync(refreshTokenValue);
      return true;
    } catch (error) {
      console.error('Manual refresh token failed:', error);
      return false;
    }
  }

  return {
    login,
    signup,
    logout,
    refreshToken,
    refetchUser,
    manualRefreshToken,
  }
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      // First try to get user from localStorage for immediate response
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          console.log('useCurrentUser - Using cached user data:', userData);
          return { data: userData };
        } catch (e) {
          console.error('Failed to parse cached user data:', e);
        }
      }
      
      // If no cached data, fetch from API
      console.log('useCurrentUser - Fetching user data from API...');
      try {
        const result = await apiService.getCurrentUser();
        console.log('useCurrentUser - API result:', result);
        return result;
      } catch (error: any) {
        console.error('useCurrentUser - API call failed:', error);
        
        // If it's a 401 error, clear invalid tokens
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.log('useCurrentUser - Clearing invalid tokens due to 401 error');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        
        throw error;
      }
    },
    enabled: !!localStorage.getItem('token'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      console.log('useCurrentUser - Retry attempt:', failureCount, error.message);
      
      // Don't retry if it's an authentication error
      if (error.message?.includes('401') || 
          error.message?.includes('Unauthorized') || 
          error.message?.includes('No token found')) {
        console.log('useCurrentUser - Not retrying due to auth error');
        return false;
      }
      
      // Don't retry more than 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}
