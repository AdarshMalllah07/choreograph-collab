import { create } from 'zustand';
import { Task, Project } from '@/types';

interface TaskStore {
  tasks: Task[];
  projects: Project[];
  selectedProject: Project | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: Task['status']) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  selectProject: (projectId: string) => void;
}

// Mock initial data
const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    ownerId: '1',
    members: ['1', '2'],
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Build native mobile application',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    ownerId: '1',
    members: ['1', '2'],
  },
];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Design Homepage Mockup',
    description: 'Create initial design concepts for the new homepage',
    status: 'todo',
    priority: 'high',
    assigneeId: '2',
    projectId: '1',
    deadline: new Date('2024-02-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Implement Authentication',
    description: 'Set up user authentication system',
    status: 'in-progress',
    priority: 'high',
    assigneeId: '1',
    projectId: '2',
    deadline: new Date('2024-02-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Database Schema Design',
    description: 'Design and document database structure',
    status: 'done',
    priority: 'medium',
    assigneeId: '1',
    projectId: '2',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Write API Documentation',
    description: 'Document all API endpoints',
    status: 'todo',
    priority: 'low',
    assigneeId: '2',
    projectId: '2',
    deadline: new Date('2024-03-01'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
  },
];

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: initialTasks,
  projects: initialProjects,
  selectedProject: initialProjects[0],
  
  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    }));
  },
  
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },
  
  moveTask: (taskId, newStatus) => {
    get().updateTask(taskId, { status: newStatus });
  },
  
  addProject: (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ projects: [...state.projects, newProject] }));
  },
  
  selectProject: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (project) {
      set({ selectedProject: project });
    }
  },
}));