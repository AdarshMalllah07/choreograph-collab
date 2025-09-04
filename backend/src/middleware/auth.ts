import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Utility function to parse time strings like "15m", "15h", "15d"
function parseTimeString(timeString: string): string {
  const match = timeString.match(/^(\d+)([mhd])$/);
  if (!match) {
    throw new Error(`Invalid time format: ${timeString}. Expected format: 15m, 15h, 15d`);
  }
  
  const [, value, unit] = match;
  if (!value || !unit) {
    throw new Error(`Invalid time format: ${timeString}. Expected format: 15m, 15h, 15d`);
  }
  
  const numValue = parseInt(value, 10);
  
  switch (unit) {
    case 'm': // minutes
      return `${numValue}m`;
    case 'h': // hours
      return `${numValue}h`;
    case 'd': // days
      return `${numValue}d`;
    default:
      throw new Error(`Invalid time unit: ${unit}. Expected: m, h, d`);
  }
}

// Get token expiry times from environment variables
function getTokenExpiry(type: 'access' | 'refresh'): string {
  const envVar = type === 'access' ? 'ACCESS_TOKEN_EXPIRY' : 'REFRESH_TOKEN_EXPIRY';
  const defaultValue = type === 'access' ? '15m' : '7d';
  const timeString = process.env[envVar] || defaultValue;
  
  try {
    return parseTimeString(timeString);
  } catch (error) {
    console.warn(`Invalid ${envVar} value: ${timeString}. Using default: ${defaultValue}`);
    return defaultValue;
  }
}

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
	const expiresIn = getTokenExpiry('access');
	return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function signRefreshToken(payload: AuthPayload): string {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('JWT_SECRET not set');
	const expiresIn = getTokenExpiry('refresh');
	return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
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
