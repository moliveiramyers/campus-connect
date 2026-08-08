import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/error.js';
import Registration from '../models/registrations.js';   

const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated?.()) {
        throw new UnauthorizedError(
            'Authentication is required. Please log in to access this resource.'
        );
    }

    next();
};

const requireRole = ({ roles = [], allowSelf = false } = {}) => {
  return (req, res, next) => {
    const hasRole = roles.includes(req.user.role);
    const isSelf = allowSelf && req.user.id === req.params.id;

    if (hasRole || isSelf) {
        return next();
    }

    throw new ForbiddenError('You do not have permission to perform this action');
  };
}

const authorizeRegistrationOwner = async (req, res, next) => {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
        throw new NotFoundError('Registration not found');
    }

    if (req.user.role === 'admin') {
        return next();
    }

    if (req.user.id !== registration.userId.toString()) {
        throw new ForbiddenError('You do not have permission to perform this action');
    }

    next();
};

export { requireAuth, requireRole, authorizeRegistrationOwner };
