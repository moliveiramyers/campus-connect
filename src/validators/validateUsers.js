import Joi from 'joi';

const sharedFields = {
    name: Joi.string()
        .trim()
        .min(2)
        .max(100),

    email: Joi.string()
        .trim()
        .lowercase()
        .email(),

    password: Joi.string()
        .min(8)
        .max(128)
        .messages({
            'string.min': 'password must contain at least 8 characters'
        }),

    role: Joi.string()
        .trim()
        .valid('user', 'admin'),

    profileImage: Joi.string()
        .trim()
        .uri()
        .max(2048)
        .allow('')
};

const createUserSchema = Joi.object({
    ...sharedFields,
    name: sharedFields.name.required(),
    email: sharedFields.email.required(),
    password: sharedFields.password.required(),
    role: sharedFields.role.default('user')
}).unknown(false);

const updateUserSchema = Joi.object({
    ...sharedFields
})
    .min(1)
    .unknown(false);

export {
    createUserSchema,
    updateUserSchema
};

export default createUserSchema;
