import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
const router = Router();
router.use(requireAuth);
// GET current user profile
router.get('/profile', async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Failed to fetch user profile' });
    }
});
// PUT update current user profile
router.put('/profile', async (req, res) => {
    try {
        const userId = req.user.userId;
        const updateSchema = z.object({
            name: z.string().min(1).max(100).optional(),
            avatar: z.string().url().optional()
        });
        const parse = updateSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ message: 'Invalid input', issues: parse.error.issues });
        }
        const updated = await User.findByIdAndUpdate(userId, { $set: parse.data }, { new: true }).select('-password');
        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            avatar: updated.avatar,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt
        });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Failed to update user profile' });
    }
});
// GET user by ID (for project members)
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.userId;
        // Check if current user has access to view this user
        // Users can only view profiles of users they share projects with
        const sharedProjects = await Project.find({
            $or: [
                { owner: currentUserId, members: userId },
                { owner: userId, members: currentUserId },
                { owner: currentUserId, owner: userId }
            ]
        });
        if (sharedProjects.length === 0 && currentUserId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt
        });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Failed to fetch user' });
    }
});
// GET search users by email or name (for adding to projects)
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const currentUserId = req.user.userId;
        if (!query || query.length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }
        // Search by email or name (case-insensitive)
        const users = await User.find({
            $and: [
                {
                    $or: [
                        { email: { $regex: query, $options: 'i' } },
                        { name: { $regex: query, $options: 'i' } }
                    ]
                },
                { _id: { $ne: currentUserId } } // Exclude current user
            ]
        }).select('name email role avatar').limit(10);
        return res.json(users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        })));
    }
    catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).json({ message: 'Failed to search users' });
    }
});
// GET users in a project (for project management)
router.get('/project/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const currentUserId = req.user.userId;
        // Check if user has access to this project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.owner.toString() !== currentUserId && !project.members.includes(currentUserId)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        // Get all users in the project (owner + members)
        const userIds = [project.owner, ...project.members];
        const users = await User.find({ _id: { $in: userIds } }).select('-password');
        return res.json(users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isOwner: project.owner.toString() === user.id
        })));
    }
    catch (error) {
        console.error('Error fetching project users:', error);
        return res.status(500).json({ message: 'Failed to fetch project users' });
    }
});
// GET current user's projects summary
router.get('/profile/projects', async (req, res) => {
    try {
        const userId = req.user.userId;
        const projects = await Project.find({
            $or: [{ owner: userId }, { members: userId }]
        }).select('name description createdAt');
        const ownedProjects = projects.filter(p => p.owner.toString() === userId);
        const memberProjects = projects.filter(p => p.owner.toString() !== userId);
        return res.json({
            total: projects.length,
            owned: ownedProjects.length,
            member: memberProjects.length,
            projects: projects.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                createdAt: p.createdAt,
                isOwner: p.owner.toString() === userId
            }))
        });
    }
    catch (error) {
        console.error('Error fetching user projects:', error);
        return res.status(500).json({ message: 'Failed to fetch user projects' });
    }
});
// DELETE current user account
router.delete('/profile', async (req, res) => {
    try {
        const userId = req.user.userId;
        // Check if user owns any projects
        const ownedProjects = await Project.find({ owner: userId });
        if (ownedProjects.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete account while owning projects. Please transfer or delete your projects first.',
                ownedProjectsCount: ownedProjects.length
            });
        }
        // Remove user from all projects they're a member of
        await Project.updateMany({ members: userId }, { $pull: { members: userId } });
        // Delete user account
        await User.findByIdAndDelete(userId);
        return res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user account:', error);
        return res.status(500).json({ message: 'Failed to delete user account' });
    }
});
export default router;
