import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { data: userData, isLoading, error } = useCurrentUser();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;
    
    // Prevent multiple redirects
    if (hasRedirected) return;
    
    // Check for authentication errors
    if (error && (error.message?.includes('401') || error.message?.includes('Unauthorized'))) {
      console.log('Index - Auth error detected, redirecting to auth');
      setHasRedirected(true);
      navigate('/auth', { replace: true });
      return;
    }
    
    // Redirect based on authentication status
    if (userData?.data && localStorage.getItem('token')) {
      console.log('Index - User authenticated, redirecting to dashboard');
      setHasRedirected(true);
      navigate('/dashboard', { replace: true });
    } else {
      console.log('Index - User not authenticated, redirecting to auth');
      setHasRedirected(true);
      navigate('/auth', { replace: true });
    }
  }, [userData, isLoading, error, navigate, hasRedirected]);

  return null;
};

export default Index;
