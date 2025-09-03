import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Column } from '../models/Column.js';
import { Project } from '../models/Project.js';
import { getNextColumnOrder, isOrderAvailable, reorderColumns } from '../utils/columnUtils.js';

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
	try {
		const parsed = paramsSchema.safeParse(req.params);
		if (!parsed.success) return res.status(400).json({ message: 'Invalid projectId' });
		const { projectId } = parsed.data;
		
		const project = await Project.findById(projectId);
		if (!project) return res.status(404).json({ message: 'Project not found' });
		
		const body = createSchema.safeParse(req.body);
		if (!body.success) return res.status(400).json({ message: 'Invalid input', issues: body.error.issues });
		
		let order: number;
		
		if (body.data.order !== undefined) {
			// Check if the provided order is available
			const isAvailable = await isOrderAvailable(projectId, body.data.order);
			if (!isAvailable) {
				const nextOrder = await getNextColumnOrder(projectId);
				return res.status(409).json({ 
					message: `Column with order ${body.data.order} already exists in this project. Please choose a different order or let the system assign one automatically.`,
					conflictingOrder: body.data.order,
					suggestedOrder: nextOrder,
					error: 'ORDER_CONFLICT'
				});
			}
			order = body.data.order;
		} else {
			// Auto-assign the next available order
			order = await getNextColumnOrder(projectId);
		}
		
		const column = await Column.create({ project: projectId, name: body.data.name, order });
		return res.status(201).json({ id: column.id, name: column.name, order: column.order });
	} catch (error: any) {
		// Handle MongoDB duplicate key errors specifically
		if (error.code === 11000) {
			const keyValue = error.keyValue;
			if (keyValue && keyValue.project && keyValue.order !== undefined) {
				const nextOrder = await getNextColumnOrder(req.params.projectId);
				return res.status(409).json({
					message: `A column with order ${keyValue.order} already exists in this project. Please choose a different order.`,
					conflictingOrder: keyValue.order,
					suggestedOrder: nextOrder,
					error: 'DUPLICATE_ORDER'
				});
			}
			return res.status(409).json({
				message: 'Column with these properties already exists. Please check for duplicates.',
				error: 'DUPLICATE_KEY'
			});
		}
		
		// Handle other errors
		console.error('Column creation error:', error);
		return res.status(500).json({ 
			message: 'Failed to create column. Please try again.',
			error: 'INTERNAL_ERROR'
		});
	}
});

const updateSchema = z.object({ name: z.string().min(1).optional(), order: z.number().int().min(0).optional() });

router.patch('/:projectId/columns/:columnId', async (req, res) => {
	try {
		const p = z.object({ projectId: z.string().length(24), columnId: z.string().length(24) }).safeParse(req.params);
		if (!p.success) return res.status(400).json({ message: 'Invalid ids' });
		
		const body = updateSchema.safeParse(req.body);
		if (!body.success) return res.status(400).json({ message: 'Invalid input', issues: body.error.issues });
		
		// If updating order, check for conflicts
		if (body.data.order !== undefined) {
			const isAvailable = await isOrderAvailable(p.data.projectId, body.data.order, p.data.columnId);
			if (!isAvailable) {
				return res.status(409).json({
					message: `Column with order ${body.data.order} already exists in this project. Please choose a different order.`,
					conflictingOrder: body.data.order,
					error: 'ORDER_CONFLICT'
				});
			}
		}
		
		const updated = await Column.findOneAndUpdate(
			{ _id: p.data.columnId, project: p.data.projectId }, 
			{ $set: body.data }, 
			{ new: true }
		);
		if (!updated) return res.status(404).json({ message: 'Column not found' });
		return res.json({ id: updated.id, name: updated.name, order: updated.order });
	} catch (error: any) {
		// Handle MongoDB duplicate key errors
		if (error.code === 11000) {
			return res.status(409).json({
				message: 'Column with these properties already exists. Please check for duplicates.',
				error: 'DUPLICATE_KEY'
			});
		}
		
		console.error('Column update error:', error);
		return res.status(500).json({ 
			message: 'Failed to update column. Please try again.',
			error: 'INTERNAL_ERROR'
		});
	}
});

// Add a new endpoint to fix column ordering conflicts
router.post('/:projectId/columns/fix-order', async (req, res) => {
	try {
		const parsed = paramsSchema.safeParse(req.params);
		if (!parsed.success) return res.status(400).json({ message: 'Invalid projectId' });
		const { projectId } = parsed.data;
		
		const project = await Project.findById(projectId);
		if (!project) return res.status(404).json({ message: 'Project not found' });
		
		await reorderColumns(projectId);
		
		const columns = await Column.find({ project: projectId }).sort({ order: 1 });
		return res.json({ 
			message: 'Column ordering has been fixed',
			columns: columns.map((c) => ({ id: c.id, name: c.name, order: c.order }))
		});
	} catch (error: any) {
		console.error('Column order fix error:', error);
		return res.status(500).json({ 
			message: 'Failed to fix column ordering. Please try again.',
			error: 'INTERNAL_ERROR'
		});
	}
});

router.delete('/:projectId/columns/:columnId', async (req, res) => {
	try {
		const p = z.object({ projectId: z.string().length(24), columnId: z.string().length(24) }).safeParse(req.params);
		if (!p.success) return res.status(400).json({ message: 'Invalid ids' });
		
		const deleted = await Column.findOneAndDelete({ _id: p.data.columnId, project: p.data.projectId });
		if (!deleted) return res.status(404).json({ message: 'Column not found' });
		return res.status(204).send();
	} catch (error: any) {
		console.error('Column deletion error:', error);
		return res.status(500).json({ 
			message: 'Failed to delete column. Please try again.',
			error: 'INTERNAL_ERROR'
		});
	}
});

export default router;
