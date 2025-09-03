import { create } from 'zustand';
import { Task, Project } from '@/types';
import apiService from '@/services/api';

interface TaskStore {
  tasks: Task[];
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Project actions
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  selectProject: (projectId: string) => void;
  
  // Task actions
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  moveTask: (taskId: string, newStatus: Task['status']) => Promise<boolean>;
  assignTask: (taskId: string, assigneeId: string) => Promise<boolean>;
  unassignTask: (taskId: string) => Promise<boolean>;
  
  // Column actions
  fetchColumns: (projectId: string) => Promise<void>;
  createColumn: (name: string, order?: number) => Promise<boolean>;
  updateColumn: (columnId: string, updates: { name?: string; order?: number }) => Promise<boolean>;
  deleteColumn: (columnId: string) => Promise<boolean>;
  fixColumnOrder: () => Promise<boolean>;
  
  // Utility
  clearError: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  
  // Project actions
  fetchProjects: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getProjects();
      
      if (response.data && Array.isArray(response.data)) {
        const projects = response.data as Project[];
        set({ projects, isLoading: false });
        
        // Select first project if none selected
        if (!get().selectedProject && projects.length > 0) {
          set({ selectedProject: projects[0] });
        }
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch projects', 
        isLoading: false 
      });
    }
  },
  
  createProject: async (projectData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.createProject(projectData.name, projectData.description);
      
      if (response.data) {
        const newProject = response.data as Project;
        set((state) => ({ 
          projects: [...state.projects, newProject],
          selectedProject: newProject,
          isLoading: false 
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create project', 
        isLoading: false 
      });
      return false;
    }
  },
  
  updateProject: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.updateProject(id, updates);
      
      if (response.data) {
        const updatedProject = response.data as Project;
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updatedProject } : p
          ),
          selectedProject: get().selectedProject?.id === id 
            ? { ...get().selectedProject, ...updatedProject }
            : get().selectedProject,
          isLoading: false
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update project', 
        isLoading: false 
      });
      return false;
    }
  },
  
  deleteProject: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await apiService.deleteProject(id);
      
      set((state) => {
        const updatedProjects = state.projects.filter((p) => p.id !== id);
        const newSelectedProject = state.selectedProject?.id === id 
          ? (updatedProjects.length > 0 ? updatedProjects[0] : null)
          : state.selectedProject;
        
        return {
          projects: updatedProjects,
          selectedProject: newSelectedProject,
          tasks: state.selectedProject?.id === id ? [] : state.tasks,
          isLoading: false
        };
      });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete project', 
        isLoading: false 
      });
      return false;
    }
  },
  
  selectProject: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (project) {
      set({ selectedProject: project, tasks: [] });
      // Fetch tasks for the selected project
      get().fetchTasks(projectId);
    }
  },
  
  // Task actions
  fetchTasks: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getTasks(projectId);
      
      if (response.data && Array.isArray(response.data)) {
        const tasks = response.data as Task[];
        set({ tasks, isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch tasks', 
        isLoading: false 
      });
    }
  },
  
  createTask: async (taskData) => {
    try {
      const selectedProject = get().selectedProject;
      if (!selectedProject) {
        set({ error: 'No project selected' });
        return false;
      }
      
      set({ isLoading: true, error: null });
      const response = await apiService.createTask(selectedProject.id, {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        assigneeId: taskData.assigneeId,
        deadline: taskData.deadline?.toISOString(),
      });
      
      if (response.data) {
        const newTask = response.data as Task;
        set((state) => ({ 
          tasks: [...state.tasks, newTask],
          isLoading: false 
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create task', 
        isLoading: false 
      });
      return false;
    }
  },
  
  updateTask: async (id, updates) => {
    try {
      const selectedProject = get().selectedProject;
      if (!selectedProject) {
        set({ error: 'No project selected' });
        return false;
      }
      
      set({ isLoading: true, error: null });
      const response = await apiService.updateTask(selectedProject.id, id, {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        assigneeId: updates.assigneeId,
        deadline: updates.deadline?.toISOString(),
      });
      
      if (response.data) {
        const updatedTask = response.data as Task;
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updatedTask } : t
          ),
          isLoading: false
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update task', 
        isLoading: false 
      });
      return false;
    }
  },
  
  deleteTask: async (id) => {
    try {
      const selectedProject = get().selectedProject;
      if (!selectedProject) {
        set({ error: 'No project selected' });
        return false;
      }
      
      set({ isLoading: true, error: null });
      await apiService.deleteTask(selectedProject.id, id);
      
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete task', 
        isLoading: false 
      });
      return false;
    }
  },
  
  moveTask: async (taskId, newStatus) => {
    return get().updateTask(taskId, { status: newStatus });
  },
  
  assignTask: async (taskId, assigneeId) => {
    try {
      const selectedProject = get().selectedProject;
      if (!selectedProject) {
        set({ error: 'No project selected' });
        return false;
      }
      
      set({ isLoading: true, error: null });
      const response = await apiService.assignTask(selectedProject.id, taskId, assigneeId);
      
      if (response.data) {
        const assignee = (response.data as any).assignee;
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, assignee } : t
          ),
          isLoading: false
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to assign task', 
        isLoading: false 
      });
      return false;
    }
  },
  
  unassignTask: async (taskId) => {
    try {
      const selectedProject = get().selectedProject;
      if (!selectedProject) {
        set({ error: 'No project selected' });
        return false;
      }
      
      set({ isLoading: true, error: null });
      await apiService.unassignTask(selectedProject.id, taskId);
      
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, assignee: null } : t
        ),
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to unassign task', 
        isLoading: false 
      });
      return false;
    }
  },
  
  // Column actions
  fetchColumns: async (projectId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getColumns(projectId);
      
      if (response.data) {
        // Columns are handled by the KanbanBoard component
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch columns', 
        isLoading: false 
      });
    }
  },
  
  createColumn: async (name, order) => {
    try {
      const selectedProject = get().selectedProject;
      if (!selectedProject) {
        set({ error: 'No project selected' });
        return false;
      }
      
      set({ isLoading: true, error: null });
      const response = await apiService.createColumn(selectedProject.id, name, order);
      
      if (response.data) {
        set({ isLoading: false });
        // Refresh columns
        get().fetchColumns(selectedProject.id);
        return true;
      }
      return false;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create column', 
        isLoading: false 
      });
      return false;
    }
  },
  
  updateColumn: async (columnId, updates) => {
    try {
      const selectedProject = get().selectedProject;
      if (!selectedProject) {
        set({ error: 'No project selected' });
        return false;
      }
      
      set({ isLoading: true, error: null });
      const response = await apiService.updateColumn(selectedProject.id, columnId, updates);
      
      if (response.data) {
        set({ isLoading: false });
        // Refresh columns
        get().fetchColumns(selectedProject.id);
        return true;
      }
      return false;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update column', 
        isLoading: false 
      });
      return false;
    }
  },
  
  deleteColumn: async (columnId) => {
    try {
      const selectedProject = get().selectedProject;
      if (!selectedProject) {
        set({ error: 'No project selected' });
        return false;
      }
      
      set({ isLoading: true, error: null });
      await apiService.deleteColumn(selectedProject.id, columnId);
      
      set({ isLoading: false });
      // Refresh columns
      get().fetchColumns(selectedProject.id);
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete column', 
        isLoading: false 
      });
      return false;
    }
  },
  
  fixColumnOrder: async () => {
    try {
      const selectedProject = get().selectedProject;
      if (!selectedProject) {
        set({ error: 'No project selected' });
        return false;
      }
      
      set({ isLoading: true, error: null });
      const response = await apiService.fixColumnOrder(selectedProject.id);
      
      if (response.data) {
        set({ isLoading: false });
        // Refresh columns
        get().fetchColumns(selectedProject.id);
        return true;
      }
      return false;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fix column order', 
        isLoading: false 
      });
      return false;
    }
  },
  
  // Utility
  clearError: () => {
    set({ error: null });
  },
}));