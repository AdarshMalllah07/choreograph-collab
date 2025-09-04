import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, requireAuth } from '../middleware/auth.js';
import { RefreshToken } from '../models/RefreshToken.js';
const router = Router();
const signupSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6)
});
router.post('/signup', async (req, res) => {
    const parse = signupSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ message: 'Invalid input', issues: parse.error.issues });
    }
    const { name, email, password } = parse.data;
    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ user: user.id, token: refreshToken, expiresAt });
    return res.status(201).json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } });
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});
router.post('/login', async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ message: 'Invalid input', issues: parse.error.issues });
    }
    const { email, password } = parse.data;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ user: user.id, token: refreshToken, expiresAt });
    return res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } });
});
const refreshSchema = z.object({ refreshToken: z.string().min(1) });
router.post('/refresh', async (req, res) => {
    const parse = refreshSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ message: 'Invalid input' });
    const { refreshToken } = parse.data;
    const record = await RefreshToken.findOne({ token: refreshToken, revoked: false, expiresAt: { $gt: new Date() } });
    if (!record)
        return res.status(401).json({ message: 'Invalid refresh token' });
    const payload = verifyRefreshToken(refreshToken);
    if (!payload)
        return res.status(401).json({ message: 'Invalid refresh token' });
    const accessToken = signAccessToken({ userId: payload.userId });
    return res.json({ accessToken });
});
router.post('/logout', requireAuth, async (req, res) => {
    await RefreshToken.updateMany({ user: req.user.userId, revoked: false }, { $set: { revoked: true } });
    return res.status(204).send();
});
export default router;
