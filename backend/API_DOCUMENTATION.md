# Choreograph Collab API Documentation

## Overview
This document describes the complete API endpoints for the Choreograph Collab backend, including all CRUD operations for projects, tasks, columns, and users.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check
- **GET** `/health` - Check API status

### Authentication
- **POST** `/auth/signup` - User registration
- **POST** `/auth/login` - User login
- **POST** `/auth/refresh` - Refresh access token
- **POST** `/auth/logout` - User logout

### Projects

#### Get All Projects
- **GET** `/projects`
- **Description**: Get all projects where the user is owner or member
- **Response**: Array of projects with owner and member details

#### Get Project by ID
- **GET** `/projects/:projectId`
- **Description**: Get specific project details
- **Response**: Project object with populated owner and members

#### Create Project
- **POST** `/projects`
- **Body**:
  ```json
  {
    "name": "Project Name",
    "description": "Project description"
  }
  ```
- **Response**: Created project object

#### Update Project
- **PUT** `/projects/:projectId`
- **Description**: Update project (owner only)
- **Body**:
  ```json
  {
    "name": "Updated Name",
    "description": "Updated description"
  }
  ```
- **Response**: Updated project object

#### Delete Project
- **DELETE** `/projects/:projectId`
- **Description**: Delete project (owner only)
- **Response**: 204 No Content

#### Add Member to Project
- **POST** `/projects/:projectId/members`
- **Body**:
  ```json
  {
    "email": "member@example.com"
  }
  ```
- **Response**: Success message

#### Remove Member from Project
- **DELETE** `/projects/:projectId/members/:memberId`
- **Description**: Remove member (owner only)
- **Response**: Success message

### Tasks

#### Get All Tasks in Project
- **GET** `/projects/:projectId/tasks`
- **Description**: Get all tasks for a specific project
- **Response**: Array of tasks with assignee and project details

#### Get Task by ID
- **GET** `/projects/:projectId/tasks/:taskId`
- **Description**: Get specific task details
- **Response**: Task object with populated assignee and project

#### Create Task
- **POST** `/projects/:projectId/tasks`
- **Body**:
  ```json
  {
    "title": "Task Title",
    "description": "Task description",
    "status": "todo",
    "priority": "medium",
    "assigneeId": "userId",
    "order": 0,
    "deadline": "2024-01-01T00:00:00.000Z"
  }
  ```
- **Response**: Created task object

#### Update Task
- **PATCH** `/projects/:projectId/tasks/:taskId`
- **Body**: Any combination of task fields
- **Response**: Updated task object

#### Delete Task
- **DELETE** `/projects/:projectId/tasks/:taskId`
- **Response**: 204 No Content

#### Assign Task
- **POST** `/projects/:projectId/tasks/:taskId/assign`
- **Body**:
  ```json
  {
    "assigneeId": "userId"
  }
  ```
- **Response**: Success message with assignee details

#### Unassign Task
- **DELETE** `/projects/:projectId/tasks/:taskId/assign`
- **Response**: Success message

### Columns

#### Get All Columns in Project
- **GET** `/projects/:projectId/columns`
- **Response**: Array of columns sorted by order

#### Create Column
- **POST** `/projects/:projectId/columns`
- **Body**:
  ```json
  {
    "name": "Column Name",
    "order": 0
  }
  ```
- **Response**: Created column object

#### Update Column
- **PATCH** `/projects/:projectId/columns/:columnId`
- **Body**: Any combination of column fields
- **Response**: Updated column object

#### Delete Column
- **DELETE** `/projects/:projectId/columns/:columnId`
- **Response**: 204 No Content

#### Fix Column Ordering
- **POST** `/projects/:projectId/columns/fix-order`
- **Description**: Automatically fix column ordering conflicts
- **Response**: Success message with updated columns

### Users

#### Get Current User Profile
- **GET** `/users/profile`
- **Response**: Current user object

#### Update Current User Profile
- **PUT** `/users/profile`
- **Body**:
  ```json
  {
    "name": "Updated Name",
    "avatar": "https://example.com/avatar.jpg"
  }
  ```
- **Response**: Updated user object

#### Get User Projects Summary
- **GET** `/users/profile/projects`
- **Response**: Summary of user's projects

#### Delete User Account
- **DELETE** `/users/profile`
- **Description**: Delete current user account
- **Response**: Success message

#### Get User by ID
- **GET** `/users/:userId`
- **Description**: Get user profile (if accessible)
- **Response**: User object

#### Search Users
- **GET** `/users/search/:query`
- **Description**: Search users by name or email
- **Response**: Array of matching users

#### Get Project Users
- **GET** `/users/project/:projectId`
- **Description**: Get all users in a specific project
- **Response**: Array of project users

## Data Models

### Project
```typescript
{
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Task
```typescript
{
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  order: number;
  project: {
    id: string;
    name: string;
  };
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Column
```typescript
{
  id: string;
  name: string;
  order: number;
  project: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "error": "ERROR_TYPE",
  "details": {},
  "suggestion": "How to fix the error"
}
```

### Common Error Types
- `ORDER_CONFLICT` - Column ordering conflict
- `DUPLICATE_KEY` - Duplicate data violation
- `VALIDATION_ERROR` - Input validation failed
- `INVALID_ID` - Invalid ObjectId format
- `NOT_FOUND` - Resource not found
- `ACCESS_DENIED` - Insufficient permissions
- `INTERNAL_ERROR` - Server error

## Status Codes

- **200** - Success
- **201** - Created
- **204** - No Content
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **500** - Internal Server Error

## Rate Limiting

Currently no rate limiting implemented.

## CORS

CORS is enabled for all origins in development. Configure `CORS_ORIGIN` environment variable for production.

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Helmet.js security headers
- Input validation with Zod
- Access control for project operations
- User permission checks
