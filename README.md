# 🎭 Choreograph Collab

A modern, collaborative project management application built with React, Node.js, and MongoDB. Choreograph Collab provides an intuitive Kanban board interface for teams to manage tasks, projects, and workflows efficiently.

## ✨ Features

### 🎯 Core Functionality
- **Project Management**: Create, manage, and collaborate on multiple projects
- **Kanban Board**: Drag-and-drop task management with customizable columns
- **Task Management**: Create, assign, and track tasks with priorities and deadlines
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Real-time Collaboration**: Multiple users can work on the same project simultaneously

### 🎨 User Interface
- **Modern Design**: Clean, responsive UI built with Tailwind CSS and shadcn/ui
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation**: Easy-to-use interface with clear visual feedback

### 🔧 Advanced Features
- **Column Management**: Add, edit, delete, and reorder columns horizontally
- **Task Assignment**: Assign tasks to team members with user search
- **Priority Levels**: Set task priorities (Low, Medium, High)
- **Deadline Tracking**: Optional deadline setting for tasks
- **Status Tracking**: Track task progress through multiple stages
- **Project Members**: Add and manage team members for each project

## 🖼️ Screenshots

### 📱 Landing Page
![Landing Page](./screenshots/01-landing-page.png)
*Welcome to Choreograph Collab - Your collaborative project management solution*

### 🔐 Authentication
![Login Page](./screenshots/02-login-page.png)
*Secure login with password visibility toggle*

![Signup Page](./screenshots/03-signup-page.png)
*User registration with form validation*

### 📊 Dashboard
![Dashboard](./screenshots/04-dashboard.png)
*Main dashboard with project selection and overview*

### 📋 Kanban Board
![Kanban Board](./screenshots/05-kanban-board.png)
*Interactive Kanban board with drag-and-drop functionality*

### ➕ Task Creation
![Task Modal](./screenshots/06-task-modal.png)
*Create new tasks with detailed information*

### 🏗️ Column Management
![Column Modal](./screenshots/07-column-modal.png)
*Add and manage custom columns for your workflow*

### 👥 Project Management
![Project Selector](./screenshots/08-project-selector.png)
*Switch between different projects*

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/choreograph-collab.git
   cd choreograph-collab
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   **Backend Environment** (`backend/.env`):
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/choreograph-collab
   JWT_SECRET=your-super-secret-jwt-key-here
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   CORS_ORIGIN=http://localhost:5173
   NODE_ENV=development
   ```

   **Frontend Environment** (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

4. **Start the application**
   ```bash
   # Start backend server (from backend directory)
   npm run dev
   
   # Start frontend development server (from frontend directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001/api

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **TanStack Query** - Powerful data synchronization for React
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **DndKit** - Drag and drop functionality
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation

### Backend Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

### Database Schema
- **Users**: User accounts with authentication
- **Projects**: Project containers with members
- **Columns**: Customizable workflow stages
- **Tasks**: Individual work items with assignments
- **RefreshTokens**: Secure token management

## 📚 API Documentation

The backend provides a comprehensive REST API with the following endpoints:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add project member

### Tasks
- `GET /api/projects/:id/tasks` - Get project tasks
- `POST /api/projects/:id/tasks` - Create new task
- `PATCH /api/projects/:id/tasks/:taskId` - Update task
- `DELETE /api/projects/:id/tasks/:taskId` - Delete task
- `POST /api/projects/:id/tasks/:taskId/assign` - Assign task

### Columns
- `GET /api/projects/:id/columns` - Get project columns
- `POST /api/projects/:id/columns` - Create new column
- `PATCH /api/projects/:id/columns/:columnId` - Update column
- `DELETE /api/projects/:id/columns/:columnId` - Delete column
- `PATCH /api/projects/:id/columns/reorder` - Reorder columns

For detailed API documentation, see [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)

## 🎯 Key Features Explained

### Drag and Drop Kanban Board
- **Intuitive Interface**: Drag tasks between columns to update their status
- **Custom Collision Detection**: Smart drop zones that prioritize column areas
- **Visual Feedback**: Clear visual indicators during drag operations
- **Column Reordering**: Drag columns horizontally to reorganize workflow

### Task Management
- **Rich Task Details**: Title, description, priority, assignee, and deadline
- **Status Tracking**: Four-stage workflow (Todo, In Progress, Review, Done)
- **Priority System**: Three priority levels with visual indicators
- **Deadline Support**: Optional deadline setting with date picker

### Project Collaboration
- **Multi-Project Support**: Work on multiple projects simultaneously
- **Team Management**: Add and remove team members
- **Role-Based Access**: Project owners and members with different permissions
- **Real-time Updates**: Changes reflect immediately across all users

### Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Refresh Tokens**: Automatic token renewal for seamless experience
- **Password Security**: bcrypt hashing for password protection
- **Input Validation**: Comprehensive validation on both client and server

## 🛠️ Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run fix-columns  # Fix column ordering issues
```

### Code Structure
```
choreograph-collab/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── models/         # MongoDB models
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── scripts/            # Utility scripts
└── screenshots/            # Application screenshots
```

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Deploy with continuous integration
- **GitHub Pages**: Free hosting for public repositories

### Backend Deployment
The backend can be deployed to:
- **Railway**: Easy Node.js deployment with MongoDB
- **Heroku**: Platform-as-a-Service with add-ons
- **DigitalOcean**: VPS with full control
- **AWS/GCP/Azure**: Cloud platform deployment

### Environment Variables for Production
```env
# Backend Production Environment
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/choreograph-collab
JWT_SECRET=your-production-jwt-secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend Production Environment
VITE_API_URL=https://your-backend-domain.com/api
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [DndKit](https://dndkit.com/) for the drag and drop functionality
- [TanStack Query](https://tanstack.com/query) for data synchronization
- [React](https://reactjs.org/) for the amazing frontend framework
- [Express.js](https://expressjs.com/) for the robust backend framework

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [API Documentation](./backend/API_DOCUMENTATION.md)
- Review the [Error Handling Guide](./backend/ERROR_HANDLING.md)

---

**Made with ❤️ by the Choreograph Collab Team**
