import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
	userId: string;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user?: AuthPayload;
		}
	}
}

export function signAccessToken(payload: AuthPayload): string {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('JWT_SECRET not set');
	return jwt.sign(payload, secret, { expiresIn: '15m' });
}

export function signRefreshToken(payload: AuthPayload): string {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('JWT_SECRET not set');
	return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyRefreshToken(token: string): AuthPayload | null {
	try {
		const secret = process.env.JWT_SECRET;
		if (!secret) throw new Error('JWT_SECRET not set');
		return jwt.verify(token, secret) as AuthPayload;
	} catch {
		return null;
	}
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ')
		? authHeader.substring('Bearer '.length)
		: undefined;
	if (!token) {
		return res.status(401).json({ message: 'Missing token' });
	}
	try {
		const secret = process.env.JWT_SECRET;
		if (!secret) throw new Error('JWT_SECRET not set');
		const decoded = jwt.verify(token, secret) as AuthPayload;
		req.user = decoded;
		return next();
	} catch {
		return res.status(401).json({ message: 'Invalid token' });
	}
}
