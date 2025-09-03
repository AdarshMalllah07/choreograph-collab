import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Column } from '../models/Column.js';
import { Project } from '../models/Project.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

const paramsSchema = z.object({ projectId: z.string().length(24) });

router.get('/:projectId/columns', async (req, res) => {
	const parsed = paramsSchema.safeParse(req.params);
	if (!parsed.success) return res.status(400).json({ message: 'Invalid projectId' });
	const { projectId } = parsed.data;
	const columns = await Column.find({ project: projectId }).sort({ order: 1 });
	return res.json(columns.map((c) => ({ id: c.id, name: c.name, order: c.order })));
});

const createSchema = z.object({ name: z.string().min(1), order: z.number().int().min(0).optional() });

router.post('/:projectId/columns', async (req, res) => {
	const parsed = paramsSchema.safeParse(req.params);
	if (!parsed.success) return res.status(400).json({ message: 'Invalid projectId' });
	const { projectId } = parsed.data;
	const project = await Project.findById(projectId);
	if (!project) return res.status(404).json({ message: 'Project not found' });
	const body = createSchema.safeParse(req.body);
	if (!body.success) return res.status(400).json({ message: 'Invalid input', issues: body.error.issues });
	const column = await Column.create({ project: projectId, ...body.data });
	return res.status(201).json({ id: column.id, name: column.name, order: column.order });
});

const updateSchema = z.object({ name: z.string().min(1).optional(), order: z.number().int().min(0).optional() });

router.patch('/:projectId/columns/:columnId', async (req, res) => {
	const p = z.object({ projectId: z.string().length(24), columnId: z.string().length(24) }).safeParse(req.params);
	if (!p.success) return res.status(400).json({ message: 'Invalid ids' });
	const body = updateSchema.safeParse(req.body);
	if (!body.success) return res.status(400).json({ message: 'Invalid input', issues: body.error.issues });
	const updated = await Column.findOneAndUpdate({ _id: p.data.columnId, project: p.data.projectId }, { $set: body.data }, { new: true });
	if (!updated) return res.status(404).json({ message: 'Column not found' });
	return res.json({ id: updated.id, name: updated.name, order: updated.order });
});

router.delete('/:projectId/columns/:columnId', async (req, res) => {
	const p = z.object({ projectId: z.string().length(24), columnId: z.string().length(24) }).safeParse(req.params);
	if (!p.success) return res.status(400).json({ message: 'Invalid ids' });
	const deleted = await Column.findOneAndDelete({ _id: p.data.columnId, project: p.data.projectId });
	if (!deleted) return res.status(404).json({ message: 'Column not found' });
	return res.status(204).send();
});

export default router;
