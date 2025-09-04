import jwt from 'jsonwebtoken';
// Utility function to parse time strings like "15m", "15h", "15d"
function parseTimeString(timeString) {
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
function getTokenExpiry(type) {
    const envVar = type === 'access' ? 'ACCESS_TOKEN_EXPIRY' : 'REFRESH_TOKEN_EXPIRY';
    const defaultValue = type === 'access' ? '15m' : '7d';
    const timeString = process.env[envVar] || defaultValue;
    try {
        return parseTimeString(timeString);
    }
    catch (error) {
        console.warn(`Invalid ${envVar} value: ${timeString}. Using default: ${defaultValue}`);
        return defaultValue;
    }
}
export function signAccessToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not set');
    const expiresIn = getTokenExpiry('access');
    return jwt.sign(payload, secret, { expiresIn });
}
export function signRefreshToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not set');
    const expiresIn = getTokenExpiry('refresh');
    return jwt.sign(payload, secret, { expiresIn });
}
export function verifyRefreshToken(token) {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error('JWT_SECRET not set');
        return jwt.verify(token, secret);
    }
    catch {
        return null;
    }
}
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring('Bearer '.length)
        : undefined;
    if (!token) {
        return res.status(401).json({ message: 'Missing token' });
    }
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error('JWT_SECRET not set');
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
