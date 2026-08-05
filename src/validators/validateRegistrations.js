import Joi from 'joi';

const objectId = Joi.string()
    .hex()
    .length(24)
    .messages({
        'string.hex': '{{#label}} must be a valid MongoDB ObjectId',
        'string.length': '{{#label}} must be a valid MongoDB ObjectId'
    });

const registrationStatus = Joi.string()
    .trim()
    .valid('registered', 'waitlisted', 'cancelled', 'attended');

const createRegistrationSchema = Joi.object({
    userId: objectId.required(),
    eventId: objectId.required(),
    status: registrationStatus.default('registered'),
    notes: Joi.string().trim().max(500).allow('')
}).unknown(false);

const updateRegistrationSchema = Joi.object({
    userId: objectId,
    eventId: objectId,
    status: registrationStatus,
    notes: Joi.string().trim().max(500).allow('')
})
    .min(1)
    .unknown(false);

export {
    createRegistrationSchema,
    updateRegistrationSchema
};
