import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // Expecting token in the header as: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'fail', message: 'Unauthorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains id, email, and role
        next();
    } catch (error) {
        return res.status(403).json({ status: 'fail', message: 'Invalid or expired token.' });
    }
};

// Role-Based Access Control (RBAC) Middleware
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action.'
            });
        }
        next();
    };
};