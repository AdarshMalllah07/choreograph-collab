import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: userData, isLoading, error } = useCurrentUser();
  const [hasHandledError, setHasHandledError] = useState(false);
  
  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('token') && !!userData?.data;

  // Handle 401 errors and clear invalid tokens
  useEffect(() => {
    if (error && !hasHandledError) {
      console.log('ProtectedRoute - Handling error:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('No token found')) {
        console.log('ProtectedRoute - Clearing invalid tokens due to auth error');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setHasHandledError(true);
      }
    }
  }, [error, hasHandledError]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If there's an authentication error, redirect to login
  if (error && (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('No token found'))) {
    console.log('ProtectedRoute - Redirecting to login due to auth error');
    return <Navigate to="/login" replace />;
  }

  // If no token, redirect to login
  if (!localStorage.getItem('token')) {
    console.log('ProtectedRoute - No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If we have a token but no user data and no error, still loading
  if (!userData?.data && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  // If we have a token but no user data and there was an error, clear tokens and redirect
  if (!userData?.data && error) {
    console.log('ProtectedRoute - Clearing tokens and redirecting due to error');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}