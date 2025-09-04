import jwt from 'jsonwebtoken';
export function signAccessToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not set');
    return jwt.sign(payload, secret, { expiresIn: '15m' });
}
export function signRefreshToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not set');
    return jwt.sign(payload, secret, { expiresIn: '7d' });
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
