import { ValidationError, ConflictError } from '../utils/error.js';

const errorHandler = (err, req, res, next) => {
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

    // Handle MongoDB duplicate key errors (unique index violations)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];

        err = new ConflictError(
            `A record with this ${field} already exists.`
        );
    }

    if (err.type === 'entity.parse.failed') {
        err = new ValidationError('Malformed JSON in request body');
    }

    // is this an error we threw intentionally via our custom classes?
    if (err.isOperational) {
        // handle validation formatting
        if (err instanceof ValidationError) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
                errors: err.details
            })
        
        }

        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }

    // Log unhandle programming/system errors
    console.error('CRITICAL SYSTEM ERROR:', err);

    return res.status(500).json({
        status: 'error',
        message: 'An unexpected internal server error occurred. Please try again later.'
    });
}

export default errorHandler;