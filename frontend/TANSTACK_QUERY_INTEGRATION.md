# TanStack Query Integration Guide

This document outlines the complete integration of TanStack Query (React Query) throughout the frontend application, replacing the previous store-based state management.

## 🚀 What is TanStack Query?

TanStack Query is a powerful data synchronization library for React that provides:
- **Automatic background refetching**
- **Cache management**
- **Optimistic updates**
- **Error handling**
- **Loading states**
- **Real-time synchronization**

## 📦 Installation

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## 🔧 Setup

### 1. Query Client Configuration

The Query Client is configured in `src/main.tsx` with optimized defaults:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

### 2. Provider Setup

The entire app is wrapped with `QueryClientProvider`:

```typescript
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## 🎣 Custom Hooks

### Authentication Hooks

#### `useAuth()`
Provides authentication mutations:
- `login` - User login
- `signup` - User registration
- `logout` - User logout
- `refreshToken` - Token refresh

#### `useCurrentUser()`
Fetches current user data with automatic caching.

### Project Hooks

#### `useProjects()`
Manages project-related operations:
- `projects` - List of all projects
- `createProject` - Create new project
- `updateProject` - Update existing project
- `deleteProject` - Delete project
- `addProjectMember` - Add member to project
- `removeProjectMember` - Remove member from project

#### `useProject(projectId)`
Fetches specific project data.

### Task Hooks

#### `useTasks(projectId)`
Manages task operations for a specific project:
- `tasks` - List of project tasks
- `createTask` - Create new task
- `updateTask` - Update existing task
- `deleteTask` - Delete task
- `assignTask` - Assign task to user
- `unassignTask` - Unassign task

#### `useTask(projectId, taskId)`
Fetches specific task data.

### Column Hooks

#### `useColumns(projectId)`
Manages column operations:
- `columns` - List of project columns
- `createColumn` - Create new column
- `updateColumn` - Update column
- `deleteColumn` - Delete column
- `fixColumnOrder` - Fix column ordering

### User Hooks

#### `useUsers()`
General user operations:
- `updateCurrentUser` - Update user profile
- `deleteCurrentUser` - Delete user account
- `getUserProjects` - Get user's projects

#### `useUser(userId)`
Fetches specific user data.

#### `useSearchUsers(query)`
Searches users with debouncing.

#### `useProjectUsers(projectId)`
Fetches users in a specific project.

## 🔄 Data Flow

### 1. Query Invalidation
When mutations succeed, related queries are automatically invalidated:

```typescript
const createTask = useMutation({
  mutationFn: (taskData) => apiService.createTask(projectId, taskData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
  },
})
```

### 2. Optimistic Updates
For better UX, you can implement optimistic updates:

```typescript
const updateTask = useMutation({
  mutationFn: ({ taskId, updates }) => apiService.updateTask(projectId, taskId, updates),
  onMutate: async ({ taskId, updates }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['tasks', projectId] })
    
    // Snapshot previous value
    const previousTasks = queryClient.getQueryData(['tasks', projectId])
    
    // Optimistically update
    queryClient.setQueryData(['tasks', projectId], (old) => 
      old.map(task => task.id === taskId ? { ...task, ...updates } : task)
    )
    
    return { previousTasks }
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previousTasks) {
      queryClient.setQueryData(['tasks', projectId], context.previousTasks)
    }
  },
})
```

## 🎯 Usage Examples

### Basic Query Usage

```typescript
function ProjectList() {
  const { projects, isLoading, error } = useProjects()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {projects.data?.data?.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  )
}
```

### Mutation Usage

```typescript
function CreateProject() {
  const { createProject } = useProjects()
  
  const handleSubmit = async (data) => {
    try {
      await createProject.mutateAsync(data)
      // Success handling
    } catch (error) {
      // Error handling
    }
  }
  
  return (
    <button 
      onClick={handleSubmit}
      disabled={createProject.isPending}
    >
      {createProject.isPending ? 'Creating...' : 'Create Project'}
    </button>
  )
}
```

## 🧹 Cache Management

### Manual Cache Updates

```typescript
// Update specific query data
queryClient.setQueryData(['project', projectId], updatedProject)

// Remove specific queries
queryClient.removeQueries({ queryKey: ['tasks', projectId] })

// Clear all cache
queryClient.clear()
```

### Cache Persistence

For production apps, consider adding cache persistence:

```bash
npm install @tanstack/react-query-persist-client
```

## 🔍 DevTools

The React Query DevTools are included for development:

- **Query Explorer**: View all queries and their states
- **Mutations**: Monitor mutation operations
- **Cache**: Inspect cache contents
- **Timeline**: Track query lifecycle

## 📱 Mobile Optimization

All hooks include mobile-optimized configurations:
- Reduced refetch intervals on mobile
- Optimized cache sizes
- Background sync considerations

## 🚨 Error Handling

### Global Error Handling

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error.status === 404) return false
        return failureCount < 3
      },
    },
  },
})
```

### Component-Level Error Handling

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: false, // Disable retry for this specific query
})

if (isError) {
  return <ErrorComponent error={error} />
}
```

## 🔄 Migration from Stores

### Before (Zustand Store)
```typescript
const { projects, fetchProjects } = useProjectStore()
useEffect(() => fetchProjects(), [])
```

### After (TanStack Query)
```typescript
const { projects } = useProjects()
// Automatic fetching, caching, and background updates
```

## 📊 Performance Benefits

1. **Automatic Background Updates**: Data stays fresh without manual intervention
2. **Smart Caching**: Reduces unnecessary API calls
3. **Optimistic Updates**: Immediate UI feedback
4. **Request Deduplication**: Multiple components requesting same data share one request
5. **Background Refetching**: Data updates while user is active

## 🎨 Best Practices

1. **Query Keys**: Use consistent, hierarchical query keys
2. **Stale Time**: Set appropriate stale times based on data volatility
3. **Error Boundaries**: Implement proper error handling
4. **Loading States**: Always show loading indicators
5. **Cache Invalidation**: Invalidate related queries after mutations

## 🔧 Troubleshooting

### Common Issues

1. **Queries not updating**: Check query key consistency
2. **Infinite loops**: Verify dependency arrays in useEffect
3. **Cache not clearing**: Ensure proper invalidation
4. **Background updates**: Check stale time and refetch settings

### Debug Mode

Enable debug mode for development:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  },
})
```

## 📚 Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Best Practices Guide](https://tanstack.com/query/latest/docs/react/guides/best-practices)
- [Migration Guide](https://tanstack.com/query/latest/docs/react/guides/migrating-to-react-query-4)

---

This integration provides a robust, performant, and maintainable data layer for the entire application, replacing manual state management with intelligent, automatic data synchronization.
