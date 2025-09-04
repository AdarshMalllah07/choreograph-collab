import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
const router = Router({ mergeParams: true });
router.use(requireAuth);
const idParam = z.object({ projectId: z.string().length(24) });
// GET all tasks for a project
router.get('/:projectId/tasks', async (req, res) => {
    try {
        const parse = idParam.safeParse(req.params);
        if (!parse.success)
            return res.status(400).json({ message: 'Invalid projectId' });
        const { projectId } = parse.data;
        const userId = req.user.userId;
        // Check if user has access to this project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.owner.toString() !== userId && !project.members.includes(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const tasks = await Task.find({ project: projectId })
            .sort({ order: 1, createdAt: 1 })
            .populate('assignee', 'name email')
            .populate('project', 'name');
        return res.json(tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            assignee: t.assignee ? { id: t.assignee._id, name: t.assignee.name, email: t.assignee.email } : null,
            order: t.order,
            project: { id: t.project._id, name: t.project.name },
            deadline: t.deadline,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        })));
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        return res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});
// GET task by ID
router.get('/:projectId/tasks/:taskId', async (req, res) => {
    try {
        const paramsSchema = z.object({
            projectId: z.string().length(24),
            taskId: z.string().length(24)
        });
        const paramsOk = paramsSchema.safeParse(req.params);
        if (!paramsOk.success)
            return res.status(400).json({ message: 'Invalid ids' });
        const { projectId, taskId } = paramsOk.data;
        const userId = req.user.userId;
        // Check if user has access to this project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.owner.toString() !== userId && !project.members.includes(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const task = await Task.findById(taskId)
            .populate('assignee', 'name email')
            .populate('project', 'name');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.project.toString() !== projectId) {
            return res.status(400).json({ message: 'Task does not belong to this project' });
        }
        return res.json({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignee: task.assignee ? { id: task.assignee._id, name: task.assignee.name, email: task.assignee.email } : null,
            order: task.order,
            project: { id: task.project._id, name: task.project.name },
            deadline: task.deadline,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        });
    }
    catch (error) {
        console.error('Error fetching task:', error);
        return res.status(500).json({ message: 'Failed to fetch task' });
    }
});
const createSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    status: z.enum(['todo', 'in-progress', 'review', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assigneeId: z.string().length(24).optional(),
    order: z.number().int().min(0).optional(),
    deadline: z.string().datetime().optional()
});
// POST create new task
router.post('/:projectId/tasks', async (req, res) => {
    try {
        const idOk = idParam.safeParse(req.params);
        if (!idOk.success)
            return res.status(400).json({ message: 'Invalid projectId' });
        const { projectId } = idOk.data;
        const userId = req.user.userId;
        // Check if user has access to this project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.owner.toString() !== userId && !project.members.includes(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const parse = createSchema.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ message: 'Invalid input', issues: parse.error.issues });
        // Validate assignee if provided
        if (parse.data.assigneeId) {
            const assignee = await User.findById(parse.data.assigneeId);
            if (!assignee) {
                return res.status(400).json({ message: 'Assignee not found' });
            }
            // Check if assignee is a member of the project
            if (!project.members.includes(parse.data.assigneeId) && project.owner.toString() !== parse.data.assigneeId) {
                return res.status(400).json({ message: 'Assignee must be a member of the project' });
            }
        }
        // Parse deadline if provided
        let deadline = undefined;
        if (parse.data.deadline) {
            deadline = new Date(parse.data.deadline);
            if (isNaN(deadline.getTime())) {
                return res.status(400).json({ message: 'Invalid deadline format' });
            }
        }
        const task = await Task.create({
            project: projectId,
            ...parse.data,
            deadline,
            status: parse.data.status || 'todo',
            priority: parse.data.priority || 'medium'
        });
        return res.status(201).json({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignee: task.assignee,
            order: task.order,
            project: String(task.project),
            deadline: task.deadline,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        });
    }
    catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({ message: 'Failed to create task' });
    }
});
const updateSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['todo', 'in-progress', 'review', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assigneeId: z.string().length(24).optional(),
    order: z.number().int().min(0).optional(),
    deadline: z.string().datetime().optional()
});
// PATCH update task
router.patch('/:projectId/tasks/:taskId', async (req, res) => {
    try {
        const paramsSchema = z.object({
            projectId: z.string().length(24),
            taskId: z.string().length(24)
        });
        const paramsOk = paramsSchema.safeParse(req.params);
        if (!paramsOk.success)
            return res.status(400).json({ message: 'Invalid ids' });
        const { projectId, taskId } = paramsOk.data;
        const userId = req.user.userId;
        // Check if user has access to this project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.owner.toString() !== userId && !project.members.includes(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const parse = updateSchema.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ message: 'Invalid input', issues: parse.error.issues });
        // Validate assignee if provided
        if (parse.data.assigneeId) {
            const assignee = await User.findById(parse.data.assigneeId);
            if (!assignee) {
                return res.status(400).json({ message: 'Assignee not found' });
            }
            // Check if assignee is a member of the project
            if (!project.members.includes(parse.data.assigneeId) && project.owner.toString() !== parse.data.assigneeId) {
                return res.status(400).json({ message: 'Assignee must be a member of the project' });
            }
        }
        // Parse deadline if provided
        let deadline = undefined;
        if (parse.data.deadline) {
            deadline = new Date(parse.data.deadline);
            if (isNaN(deadline.getTime())) {
                return res.status(400).json({ message: 'Invalid deadline format' });
            }
        }
        const updateData = { ...parse.data };
        if (deadline !== undefined) {
            updateData.deadline = deadline;
        }
        else if (parse.data.deadline === null || parse.data.deadline === '') {
            // Allow clearing the deadline by setting it to null
            updateData.deadline = null;
        }
        const updated = await Task.findOneAndUpdate({ _id: taskId, project: projectId }, { $set: updateData }, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Task not found' });
        return res.json({
            id: updated.id,
            title: updated.title,
            description: updated.description,
            status: updated.status,
            priority: updated.priority,
            assignee: updated.assignee,
            order: updated.order,
            project: String(updated.project),
            deadline: updated.deadline,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt
        });
    }
    catch (error) {
        console.error('Error updating task:', error);
        return res.status(500).json({ message: 'Failed to update task' });
    }
});
// DELETE task
router.delete('/:projectId/tasks/:taskId', async (req, res) => {
    try {
        const paramsSchema = z.object({
            projectId: z.string().length(24),
            taskId: z.string().length(24)
        });
        const paramsOk = paramsSchema.safeParse(req.params);
        if (!paramsOk.success)
            return res.status(400).json({ message: 'Invalid ids' });
        const { projectId, taskId } = paramsOk.data;
        const userId = req.user.userId;
        // Check if user has access to this project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.owner.toString() !== userId && !project.members.includes(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const deleted = await Task.findOneAndDelete({ _id: taskId, project: projectId });
        if (!deleted)
            return res.status(404).json({ message: 'Task not found' });
        return res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({ message: 'Failed to delete task' });
    }
});
// POST assign task to user
router.post('/:projectId/tasks/:taskId/assign', async (req, res) => {
    try {
        const paramsSchema = z.object({
            projectId: z.string().length(24),
            taskId: z.string().length(24)
        });
        const paramsOk = paramsSchema.safeParse(req.params);
        if (!paramsOk.success)
            return res.status(400).json({ message: 'Invalid ids' });
        const { projectId, taskId } = paramsOk.data;
        const { assigneeId } = req.body;
        const userId = req.user.userId;
        if (!assigneeId) {
            return res.status(400).json({ message: 'Assignee ID is required' });
        }
        // Check if user has access to this project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.owner.toString() !== userId && !project.members.includes(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        // Validate assignee
        const assignee = await User.findById(assigneeId);
        if (!assignee) {
            return res.status(400).json({ message: 'Assignee not found' });
        }
        // Check if assignee is a member of the project
        if (!project.members.includes(assigneeId) && project.owner.toString() !== assigneeId) {
            return res.status(400).json({ message: 'Assignee must be a member of the project' });
        }
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.project.toString() !== projectId) {
            return res.status(400).json({ message: 'Task does not belong to this project' });
        }
        task.assignee = assigneeId;
        await task.save();
        return res.json({ message: 'Task assigned successfully', assignee: { id: assignee._id, name: assignee.name, email: assignee.email } });
    }
    catch (error) {
        console.error('Error assigning task:', error);
        return res.status(500).json({ message: 'Failed to assign task' });
    }
});
// DELETE unassign task
router.delete('/:projectId/tasks/:taskId/assign', async (req, res) => {
    try {
        const paramsSchema = z.object({
            projectId: z.string().length(24),
            taskId: z.string().length(24)
        });
        const paramsOk = paramsSchema.safeParse(req.params);
        if (!paramsOk.success)
            return res.status(400).json({ message: 'Invalid ids' });
        const { projectId, taskId } = paramsOk.data;
        const userId = req.user.userId;
        // Check if user has access to this project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.owner.toString() !== userId && !project.members.includes(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.project.toString() !== projectId) {
            return res.status(400).json({ message: 'Task does not belong to this project' });
        }
        task.assignee = undefined;
        await task.save();
        return res.json({ message: 'Task unassigned successfully' });
    }
    catch (error) {
        console.error('Error unassigning task:', error);
        return res.status(500).json({ message: 'Failed to unassign task' });
    }
});
export default router;
