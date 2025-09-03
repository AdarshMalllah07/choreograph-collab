import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';

const router = Router();

router.use(requireAuth);

// GET all projects for current user
router.get('/', async (req, res) => {
	try {
		const userId = req.user!.userId;
		const projects = await Project.find({ $or: [{ owner: userId }, { members: userId }] })
			.sort({ createdAt: -1 })
			.populate('owner', 'name email')
			.populate('members', 'name email');
		
		return res.json(projects.map((p) => ({
			id: p.id,
			name: p.name,
			description: p.description,
			owner: { id: p.owner._id, name: p.owner.name, email: p.owner.email },
			members: p.members.map(m => ({ id: m._id, name: m.name, email: m.email })),
			createdAt: p.createdAt,
			updatedAt: p.updatedAt
		})));
	} catch (error) {
		console.error('Error fetching projects:', error);
		return res.status(500).json({ message: 'Failed to fetch projects' });
	}
});

// GET project by ID
router.get('/:projectId', async (req, res) => {
	try {
		const projectId = req.params.projectId;
		const userId = req.user!.userId;
		
		const project = await Project.findById(projectId)
			.populate('owner', 'name email')
			.populate('members', 'name email');
		
		if (!project) {
			return res.status(404).json({ message: 'Project not found' });
		}
		
		// Check if user has access to this project
		if (project.owner.toString() !== userId && !project.members.includes(userId)) {
			return res.status(403).json({ message: 'Access denied' });
		}
		
		return res.json({
			id: project.id,
			name: project.name,
			description: project.description,
			owner: { id: project.owner._id, name: project.owner.name, email: project.owner.email },
			members: project.members.map(m => ({ id: m._id, name: m.name, email: m.email })),
			createdAt: project.createdAt,
			updatedAt: project.updatedAt
		});
	} catch (error) {
		console.error('Error fetching project:', error);
		return res.status(500).json({ message: 'Failed to fetch project' });
	}
});

const createSchema = z.object({ 
	name: z.string().min(1).max(100),
	description: z.string().optional()
});

// POST create new project
router.post('/', async (req, res) => {
	try {
		const parse = createSchema.safeParse(req.body);
		if (!parse.success) return res.status(400).json({ message: 'Invalid input', issues: parse.error.issues });
		
		const userId = req.user!.userId;
		const project = await Project.create({ 
			name: parse.data.name, 
			description: parse.data.description || '',
			owner: userId, 
			members: [userId] 
		});
		
		return res.status(201).json({ 
			id: project.id, 
			name: project.name, 
			description: project.description,
			owner: String(project.owner),
			members: project.members.map(m => String(m)),
			createdAt: project.createdAt,
			updatedAt: project.updatedAt
		});
	} catch (error) {
		console.error('Error creating project:', error);
		return res.status(500).json({ message: 'Failed to create project' });
	}
});

const updateSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().optional()
});

// PUT update project (only owner can update)
router.put('/:projectId', async (req, res) => {
	try {
		const projectId = req.params.projectId;
		const userId = req.user!.userId;
		
		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: 'Project not found' });
		}
		
		// Only owner can update project
		if (project.owner.toString() !== userId) {
			return res.status(403).json({ message: 'Only project owner can update project' });
		}
		
		const parse = updateSchema.safeParse(req.body);
		if (!parse.success) return res.status(400).json({ message: 'Invalid input', issues: parse.error.issues });
		
		const updated = await Project.findByIdAndUpdate(
			projectId,
			{ $set: parse.data },
			{ new: true }
		);
		
		return res.json({
			id: updated!.id,
			name: updated!.name,
			description: updated!.description,
			owner: String(updated!.owner),
			members: updated!.members.map(m => String(m)),
			createdAt: updated!.createdAt,
			updatedAt: updated!.updatedAt
		});
	} catch (error) {
		console.error('Error updating project:', error);
		return res.status(500).json({ message: 'Failed to update project' });
	}
});

// DELETE project (only owner can delete)
router.delete('/:projectId', async (req, res) => {
	try {
		const projectId = req.params.projectId;
		const userId = req.user!.userId;
		
		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: 'Project not found' });
		}
		
		// Only owner can delete project
		if (project.owner.toString() !== userId) {
			return res.status(403).json({ message: 'Only project owner can delete project' });
		}
		
		await Project.findByIdAndDelete(projectId);
		return res.status(204).send();
	} catch (error) {
		console.error('Error deleting project:', error);
		return res.status(500).json({ message: 'Failed to delete project' });
	}
});

// POST add member to project
router.post('/:projectId/members', async (req, res) => {
	try {
		const projectId = req.params.projectId;
		const userId = req.user!.userId;
		const { email } = req.body;
		
		if (!email) {
			return res.status(400).json({ message: 'Email is required' });
		}
		
		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: 'Project not found' });
		}
		
		// Only owner can add members
		if (project.owner.toString() !== userId) {
			return res.status(403).json({ message: 'Only project owner can add members' });
		}
		
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		
		if (project.members.includes(user._id)) {
			return res.status(400).json({ message: 'User is already a member' });
		}
		
		project.members.push(user._id);
		await project.save();
		
		return res.json({ message: 'Member added successfully' });
	} catch (error) {
		console.error('Error adding member:', error);
		return res.status(500).json({ message: 'Failed to add member' });
	}
});

// DELETE remove member from project
router.delete('/:projectId/members/:memberId', async (req, res) => {
	try {
		const { projectId, memberId } = req.params;
		const userId = req.user!.userId;
		
		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: 'Project not found' });
		}
		
		// Only owner can remove members
		if (project.owner.toString() !== userId) {
			return res.status(403).json({ message: 'Only project owner can remove members' });
		}
		
		// Cannot remove owner
		if (project.owner.toString() === memberId) {
			return res.status(400).json({ message: 'Cannot remove project owner' });
		}
		
		project.members = project.members.filter(m => m.toString() !== memberId);
		await project.save();
		
		return res.json({ message: 'Member removed successfully' });
	} catch (error) {
		console.error('Error removing member:', error);
		return res.status(500).json({ message: 'Failed to remove member' });
	}
});

export default router;
