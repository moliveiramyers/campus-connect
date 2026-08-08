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

const publicCreateUserSchema = Joi.object({
    name: sharedFields.name.required(),
    email: sharedFields.email.required(),
    password: sharedFields.password.required(),
    profileImage: sharedFields.profileImage
}).unknown(false);

const adminCreateUserSchema = publicCreateUserSchema.keys({
    role: sharedFields.role.required()
});

const publicUpdateUserSchema = Joi.object({
    name: sharedFields.name,
    email: sharedFields.email,
    password: sharedFields.password,
    profileImage: sharedFields.profileImage
})
    .min(1)
    .unknown(false);

const adminUpdateUserSchema = publicUpdateUserSchema.keys({
    role: sharedFields.role
});

const authLoginSchema = Joi.object({
    email: sharedFields.email.required(),
    password: sharedFields.password.required()
}).unknown(false);

export {
    publicCreateUserSchema,
    adminCreateUserSchema,
    publicUpdateUserSchema,
    adminUpdateUserSchema,
    authLoginSchema
};
