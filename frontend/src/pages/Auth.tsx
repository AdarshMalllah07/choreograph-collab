import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Set the form type based on the current route
  useEffect(() => {
    if (location.pathname === '/signup') {
      setIsLogin(false);
    } else if (location.pathname === '/login') {
      setIsLogin(true);
    } else {
      // Default to login for /auth route
      setIsLogin(true);
    }
  }, [location.pathname]);

  const handleFormToggle = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    // Navigate to the appropriate route
    navigate(newIsLogin ? '/login' : '/signup', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container relative min-h-screen flex items-center justify-center py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-6xl">
          {/* Left side - Hero content */}
          <div className="hidden lg:block space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <img 
                  src="/appIcons/android-chrome-192x192.png" 
                  alt="TaskFlow" 
                  className="h-16 w-16"
                />
                <h1 className="text-5xl font-bold">
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    TaskFlow
                  </span>
                </h1>
              </div>
              <p className="text-2xl text-muted-foreground">
                Cloud-Based Task Management System
              </p>
            </div>
            <p className="text-lg text-muted-foreground">
              Streamline your workflow, collaborate with your team, and achieve your goals with our powerful task management platform.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-foreground">Drag & Drop Kanban Boards</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-foreground">Real-time Collaboration</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-foreground">Project & Task Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-foreground">Role-Based Access Control</span>
              </div>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="w-full space-y-6">
            {isLogin ? <LoginForm /> : <SignupForm />}
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={handleFormToggle}
                className="text-primary hover:text-primary/80"
              >
                {isLogin ? 'Create an account' : 'Sign in'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}