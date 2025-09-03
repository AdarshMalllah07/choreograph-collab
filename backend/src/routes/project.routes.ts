import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Project } from '../models/Project.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
	const userId = req.user!.userId;
	const projects = await Project.find({ $or: [{ owner: userId }, { members: userId }] })
		.sort({ createdAt: -1 });
	return res.json(projects.map((p) => ({ id: p.id, name: p.name, owner: String(p.owner) })));
});

const createSchema = z.object({ name: z.string().min(1) });

router.post('/', async (req, res) => {
	const parse = createSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid input', issues: parse.error.issues });
	const userId = req.user!.userId;
	const project = await Project.create({ name: parse.data.name, owner: userId, members: [userId] });
	return res.status(201).json({ id: project.id, name: project.name, owner: String(project.owner) });
});

export default router;
