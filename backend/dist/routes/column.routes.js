import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Column } from '../models/Column.js';
import { Project } from '../models/Project.js';
import { getNextColumnOrder, isOrderAvailable, reorderColumns } from '../utils/columnUtils.js';
const router = Router({ mergeParams: true });
router.use(requireAuth);
const paramsSchema = z.object({ projectId: z.string().min(1) });
router.get('/:projectId/columns', async (req, res) => {
    const parsed = paramsSchema.safeParse(req.params);
    if (!parsed.success)
        return res.status(400).json({ message: 'Invalid projectId' });
    const { projectId } = parsed.data;
    const columns = await Column.find({ project: projectId }).sort({ order: 1 });
    return res.json(columns.map((c) => ({ id: c.id, name: c.name, order: c.order })));
});
const createSchema = z.object({ name: z.string().min(1), order: z.number().int().min(0).optional() });
router.post('/:projectId/columns', async (req, res) => {
    try {
        const parsed = paramsSchema.safeParse(req.params);
        if (!parsed.success)
            return res.status(400).json({ message: 'Invalid projectId' });
        const { projectId } = parsed.data;
        const project = await Project.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const body = createSchema.safeParse(req.body);
        if (!body.success)
            return res.status(400).json({ message: 'Invalid input', issues: body.error.issues });
        // Check if column name already exists in this project
        const existingColumn = await Column.findOne({
            project: projectId,
            name: { $regex: new RegExp(`^${body.data.name.trim()}$`, 'i') } // Case-insensitive exact match
        });
        if (existingColumn) {
            return res.status(409).json({
                message: `A column with the name "${body.data.name}" already exists in this project. Please choose a different name.`,
                conflictingName: body.data.name,
                error: 'DUPLICATE_NAME'
            });
        }
        let order;
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
        }
        else {
            // Auto-assign the next available order
            order = await getNextColumnOrder(projectId);
        }
        const column = await Column.create({ project: projectId, name: body.data.name, order });
        return res.status(201).json({ id: column.id, name: column.name, order: column.order });
    }
    catch (error) {
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
// Add a new endpoint to reorder columns
const reorderSchema = z.object({
    columns: z.array(z.object({
        id: z.string().min(1),
        order: z.number().int().min(0)
    })).min(1)
});
router.patch('/:projectId/columns/reorder', async (req, res) => {
    try {
        const parsed = paramsSchema.safeParse(req.params);
        if (!parsed.success)
            return res.status(400).json({ message: 'Invalid projectId' });
        const { projectId } = parsed.data;
        const project = await Project.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        const body = reorderSchema.safeParse(req.body);
        if (!body.success)
            return res.status(400).json({ message: 'Invalid input', issues: body.error.issues });
        // Get all existing columns for this project
        const existingColumns = await Column.find({ project: projectId });
        const existingColumnIds = existingColumns.map(col => col._id?.toString() || '');
        // Validate that all provided column IDs exist in this project
        const providedIds = body.data.columns.map(col => col.id);
        const invalidIds = providedIds.filter(id => !existingColumnIds.includes(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({
                message: 'Invalid column IDs provided',
                invalidIds
            });
        }
        // Use a two-phase approach to avoid unique constraint conflicts
        // Phase 1: Set all columns to temporary negative orders
        const tempOrderPromises = existingColumns.map(col => Column.findByIdAndUpdate(col._id, { order: -(col.order + 1000) }));
        await Promise.all(tempOrderPromises);
        // Phase 2: Set the new orders
        const newOrderPromises = body.data.columns.map(({ id, order }) => Column.findByIdAndUpdate(id, { order }));
        await Promise.all(newOrderPromises);
        // Return updated columns
        const columns = await Column.find({ project: projectId }).sort({ order: 1 });
        return res.json({
            message: 'Columns reordered successfully',
            columns: columns.map((c) => ({ id: c.id, name: c.name, order: c.order }))
        });
    }
    catch (error) {
        console.error('Column reorder error:', error);
        return res.status(500).json({
            message: 'Failed to reorder columns. Please try again.',
            error: 'INTERNAL_ERROR'
        });
    }
});
const updateSchema = z.object({ name: z.string().min(1).optional(), order: z.number().int().min(0).optional() });
router.patch('/:projectId/columns/:columnId', async (req, res) => {
    try {
        const p = z.object({ projectId: z.string().min(1), columnId: z.string().min(1) }).safeParse(req.params);
        if (!p.success)
            return res.status(400).json({ message: 'Invalid ids' });
        const body = updateSchema.safeParse(req.body);
        if (!body.success)
            return res.status(400).json({ message: 'Invalid input', issues: body.error.issues });
        // If updating name, check for conflicts
        if (body.data.name !== undefined) {
            const existingColumn = await Column.findOne({
                project: p.data.projectId,
                name: { $regex: new RegExp(`^${body.data.name.trim()}$`, 'i') }, // Case-insensitive exact match
                _id: { $ne: p.data.columnId } // Exclude current column
            });
            if (existingColumn) {
                return res.status(409).json({
                    message: `A column with the name "${body.data.name}" already exists in this project. Please choose a different name.`,
                    conflictingName: body.data.name,
                    error: 'DUPLICATE_NAME'
                });
            }
        }
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
        const updated = await Column.findOneAndUpdate({ _id: p.data.columnId, project: p.data.projectId }, { $set: body.data }, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Column not found' });
        return res.json({ id: updated.id, name: updated.name, order: updated.order });
    }
    catch (error) {
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
        if (!parsed.success)
            return res.status(400).json({ message: 'Invalid projectId' });
        const { projectId } = parsed.data;
        const project = await Project.findById(projectId);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        await reorderColumns(projectId);
        const columns = await Column.find({ project: projectId }).sort({ order: 1 });
        return res.json({
            message: 'Column ordering has been fixed',
            columns: columns.map((c) => ({ id: c.id, name: c.name, order: c.order }))
        });
    }
    catch (error) {
        console.error('Column order fix error:', error);
        return res.status(500).json({
            message: 'Failed to fix column ordering. Please try again.',
            error: 'INTERNAL_ERROR'
        });
    }
});
router.delete('/:projectId/columns/:columnId', async (req, res) => {
    try {
        const p = z.object({ projectId: z.string().min(1), columnId: z.string().min(1) }).safeParse(req.params);
        if (!p.success)
            return res.status(400).json({ message: 'Invalid ids' });
        const deleted = await Column.findOneAndDelete({ _id: p.data.columnId, project: p.data.projectId });
        if (!deleted)
            return res.status(404).json({ message: 'Column not found' });
        return res.status(204).send();
    }
    catch (error) {
        console.error('Column deletion error:', error);
        return res.status(500).json({
            message: 'Failed to delete column. Please try again.',
            error: 'INTERNAL_ERROR'
        });
    }
});
export default router;
