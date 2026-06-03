import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || '2r-service-secret';
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d'),
    });
}
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
// Express middleware
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token tidak ditemukan. Silakan login.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa.' });
    }
}
