import { UnauthorizedError } from '../utils/error.js';

const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated?.()) {
        throw new UnauthorizedError(
            'Authentication is required. Sign in with GitHub at /auth/github.'
        );
    }

    next();
};

export default requireAuth;
