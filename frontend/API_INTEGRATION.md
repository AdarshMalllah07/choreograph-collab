# Frontend API Integration Guide

## Overview
The frontend has been updated to use real backend APIs instead of mock data. This document explains how the integration works and how to use it.

## Architecture

### 1. API Service Layer (`src/services/api.ts`)
- **Centralized API communication**: All HTTP requests go through a single service class
- **Authentication handling**: Automatically includes JWT tokens in headers
- **Error handling**: Consistent error responses and status codes
- **Type safety**: Full TypeScript support for API responses

### 2. State Management Updates
- **Auth Store**: Now uses real login/signup/logout APIs
- **Task Store**: Fetches real projects and tasks from backend
- **Loading states**: Proper loading indicators during API calls
- **Error handling**: Toast notifications for API errors

### 3. Component Updates
- **Dashboard**: Fetches projects on mount, shows loading states
- **Auth Forms**: Real authentication with proper error handling
- **Project Selector**: Create new projects via API
- **Header**: Real user data and logout functionality

## Key Features

### Authentication Flow
1. **Login/Signup**: Credentials sent to backend, JWT tokens stored
2. **Token Management**: Access token stored in localStorage
3. **Auto-refresh**: User data refreshed on app load if token exists
4. **Logout**: Clears tokens and redirects to login

### Data Fetching
1. **Projects**: Fetched on dashboard load
2. **Tasks**: Fetched when project is selected
3. **Real-time Updates**: State updates after successful API calls
4. **Error Recovery**: Automatic retry and user feedback

### User Experience
1. **Loading States**: Spinners and disabled buttons during API calls
2. **Error Messages**: Toast notifications for all errors
3. **Form Validation**: Client-side validation before API calls
4. **Responsive Design**: Works on all screen sizes

## Environment Configuration

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Choreograph Collab
VITE_APP_VERSION=1.0.0
```

## API Endpoints Used

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `GET /users/profile` - Get current user

### Projects
- `GET /projects` - List user's projects
- `POST /projects` - Create new project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Tasks
- `GET /projects/:id/tasks` - List project tasks
- `POST /projects/:id/tasks` - Create new task
- `PATCH /projects/:id/tasks/:id` - Update task
- `DELETE /projects/:id/tasks/:id` - Delete task

### Columns
- `GET /projects/:id/columns` - List project columns
- `POST /projects/:id/columns` - Create new column
- `PATCH /projects/:id/columns/:id` - Update column
- `DELETE /projects/:id/columns/:id` - Delete column

## Error Handling

### API Errors
- **Network errors**: Automatic retry with user feedback
- **Validation errors**: Form validation before submission
- **Authentication errors**: Redirect to login if token expires
- **Server errors**: User-friendly error messages

### User Feedback
- **Success**: Toast notifications for successful operations
- **Errors**: Toast notifications with error details
- **Loading**: Visual indicators during API calls
- **Validation**: Real-time form validation

## State Management

### Auth Store
```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}
```

### Task Store
```typescript
interface TaskStore {
  tasks: Task[];
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Project actions
  fetchProjects: () => Promise<void>;
  createProject: (project: ProjectData) => Promise<boolean>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  
  // Task actions
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (task: TaskData) => Promise<boolean>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
}
```

## Usage Examples

### Creating a Project
```typescript
const { createProject } = useTaskStore();

const handleCreate = async () => {
  const success = await createProject({
    name: "New Project",
    description: "Project description"
  });
  
  if (success) {
    // Project created successfully
    toast.success("Project created!");
  }
};
```

### Fetching Tasks
```typescript
const { fetchTasks, tasks, isLoading } = useTaskStore();

useEffect(() => {
  if (selectedProject) {
    fetchTasks(selectedProject.id);
  }
}, [selectedProject, fetchTasks]);

if (isLoading) {
  return <div>Loading tasks...</div>;
}
```

### Handling Errors
```typescript
const { error, clearError } = useTaskStore();

useEffect(() => {
  if (error) {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
    clearError();
  }
}, [error, toast, clearError]);
```

## Testing

### Backend Requirements
- Backend must be running on configured URL
- MongoDB connection established
- All API endpoints working correctly
- CORS configured for frontend domain

### Frontend Testing
- Start frontend: `npm run dev`
- Test authentication flow
- Test project creation and management
- Test task operations
- Verify error handling

## Troubleshooting

### Common Issues
1. **CORS errors**: Check backend CORS configuration
2. **Authentication failures**: Verify JWT token handling
3. **Network errors**: Check backend URL and connectivity
4. **Type errors**: Ensure backend response types match frontend

### Debug Mode
Enable debug logging in the API service:
```typescript
// In api.ts
console.log('API Request:', { endpoint, options });
console.log('API Response:', response);
```

## Future Enhancements

### Planned Features
- **Real-time updates**: WebSocket integration for live data
- **Offline support**: Service worker for offline functionality
- **File uploads**: Image and document attachments
- **Advanced filtering**: Search and filter tasks/projects
- **Team collaboration**: Real-time user presence

### Performance Optimizations
- **Request caching**: Cache frequently accessed data
- **Lazy loading**: Load data on demand
- **Pagination**: Handle large datasets efficiently
- **Optimistic updates**: Immediate UI feedback
