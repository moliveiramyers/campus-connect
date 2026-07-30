import { ValidationError, ConflictError } from '../utils/error.js';

const normalizeError = (error) => {
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0] || 'field';
        return new ConflictError(`A record with this ${field} already exists.`);
    }

    if (error.type === 'entity.parse.failed') {
        return new ValidationError('Malformed JSON in request body');
    }

    if (error.name === 'CastError') {
        return new ValidationError(`Invalid value for ${error.path}.`);
    }

    if (error.name === 'ValidationError' && !error.isOperational) {
        const details = Object.values(error.errors || {}).map((item) => ({
            field: item.path,
            message: item.message
        }));

        return new ValidationError('Database validation failed.', details);
    }

    return error;
};

const errorHandler = (err, req, res, next) => {
    err = normalizeError(err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            // if it's a validation error, include the validation field array
            fields: err instanceof ValidationError ? err.details : undefined,
            stack: err.stack,
            error: err
        });
    }

    if (err.isOperational) {
        if (err instanceof ValidationError) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
                errors: err.details
            });
        }

        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    console.error('CRITICAL SYSTEM ERROR:', err);

    return res.status(500).json({
        status: 'error',
        message: 'An unexpected internal server error occurred. Please try again later.'
    });
};

export default errorHandler;
