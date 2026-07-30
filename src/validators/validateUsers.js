import Joi from 'joi';

const userSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required(),
    
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),
    
    password: Joi.string()
        .trim()
        .min(8)
        .max(128)
        .required(),
    
    role: Joi.string()
        .trim()
        .valid('user', 'admin')
        .required(),
    
    profileImage: Joi.string()
        .optional()
});

export default userSchema;