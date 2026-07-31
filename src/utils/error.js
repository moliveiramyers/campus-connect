class AppError extends Error {
    constructor(statusCode, message) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// 400 Bad Request / Validation Failure
class ValidationError extends AppError {
    constructor(message = 'Invalid input data', details = []) {
        super(400, message);
        this.details = details; // Store array for failing fields
    }
}

// 401 Unauthorized 
class UnauthorizedError extends AppError {
    constructor(message = 'You are not logged in. Please log in to get access') {
        super(401, message);
    }
}

// 403 Forbidden (Logged in, but no permission for this specific resource)
class ForbiddenError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(403, message);
    }
}

// 404 Resource not found
class NotFoundError extends AppError {
    constructor(message = 'The requested resource could not be found') {
        super(404, message);
    }
}

// 409 Conflict (Duplicate data like emails or usernames)
class ConflictError extends AppError {
    constructor(message = 'This resource already exists.') {
        super(409, message);
    }
}

export {
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError
}