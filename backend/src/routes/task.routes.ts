import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

const idParam = z.object({ projectId: z.string().length(24) });

router.get('/:projectId/tasks', async (req, res) => {
	const parse = idParam.safeParse(req.params);
	if (!parse.success) return res.status(400).json({ message: 'Invalid projectId' });
	const { projectId } = parse.data;
	const tasks = await Task.find({ project: projectId }).sort({ order: 1, createdAt: 1 });
	return res.json(tasks.map((t) => ({
		id: t.id,
		title: t.title,
		description: t.description,
		status: t.status,
		assignee: t.assignee ? String(t.assignee) : undefined,
		order: t.order,
		project: String(t.project)
	})));
});

const createSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	status: z.string().optional(),
	order: z.number().int().min(0).optional()
});

router.post('/:projectId/tasks', async (req, res) => {
	const idOk = idParam.safeParse(req.params);
	if (!idOk.success) return res.status(400).json({ message: 'Invalid projectId' });
	const { projectId } = idOk.data;
	const project = await Project.findById(projectId);
	if (!project) return res.status(404).json({ message: 'Project not found' });
	const parse = createSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid input', issues: parse.error.issues });
	const t = await Task.create({ project: projectId, ...parse.data });
	return res.status(201).json({ id: t.id, title: t.title, description: t.description, status: t.status, order: t.order, project: String(t.project) });
});

const updateSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	status: z.string().optional(),
	order: z.number().int().min(0).optional()
});

router.patch('/:projectId/tasks/:taskId', async (req, res) => {
	const paramsSchema = z.object({ projectId: z.string().length(24), taskId: z.string().length(24) });
	const paramsOk = paramsSchema.safeParse(req.params);
	if (!paramsOk.success) return res.status(400).json({ message: 'Invalid ids' });
	const parse = updateSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid input', issues: parse.error.issues });
	const updated = await Task.findOneAndUpdate(
		{ _id: paramsOk.data.taskId, project: paramsOk.data.projectId },
		{ $set: parse.data },
		{ new: true }
	);
	if (!updated) return res.status(404).json({ message: 'Task not found' });
	return res.json({ id: updated.id, title: updated.title, description: updated.description, status: updated.status, order: updated.order, project: String(updated.project) });
});

router.delete('/:projectId/tasks/:taskId', async (req, res) => {
	const paramsSchema = z.object({ projectId: z.string().length(24), taskId: z.string().length(24) });
	const paramsOk = paramsSchema.safeParse(req.params);
	if (!paramsOk.success) return res.status(400).json({ message: 'Invalid ids' });
	const deleted = await Task.findOneAndDelete({ _id: paramsOk.data.taskId, project: paramsOk.data.projectId });
	if (!deleted) return res.status(404).json({ message: 'Task not found' });
	return res.status(204).send();
});

export default router;
