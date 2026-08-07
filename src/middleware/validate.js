import { ValidationError } from '../utils/error.js';

const validate = (schemaOrFactory) => {
    return (req, res, next) => {
        const schema = typeof schemaOrFactory === 'function' ? schemaOrFactory(req) : schemaOrFactory;

        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorDetails = error.details.map((err) => ({
                field: err.path.join('.'),
                message: err.message.replace(/['"]/g, '')
            }));

            throw new ValidationError('Validation failed for this request.', errorDetails);
        }

        req.body = value;

        next();
    }
}

export default validate;