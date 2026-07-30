import Joi from 'joi';

const objectId = Joi.string()
    .hex()
    .length(24)
    .messages({
        'string.hex': '{{#label}} must be a valid MongoDB ObjectId',
        'string.length': '{{#label}} must be a valid MongoDB ObjectId'
    });

const sharedFields = {
    title: Joi.string().trim().min(3).max(150),
    description: Joi.string().trim().min(10).max(5000),
    category: Joi.string().trim().min(2).max(80),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    venueId: objectId,
    organizerId: objectId,
    capacity: Joi.number().integer().min(1).max(100000),
    status: Joi.string()
        .trim()
        .valid('draft', 'published', 'cancelled', 'completed'),
    imageUrl: Joi.string().trim().uri().max(2048).allow('')
};

const createEventSchema = Joi.object({
    ...sharedFields,
    title: sharedFields.title.required(),
    description: sharedFields.description.required(),
    category: sharedFields.category.required(),
    startDate: sharedFields.startDate.required(),
    endDate: sharedFields.endDate
        .greater(Joi.ref('startDate'))
        .required()
        .messages({
            'date.greater': 'endDate must be later than startDate'
        }),
    venueId: sharedFields.venueId.required(),
    organizerId: sharedFields.organizerId.required(),
    capacity: sharedFields.capacity.required(),
    status: sharedFields.status.default('draft')
}).unknown(false);

const updateEventSchema = Joi.object({
    ...sharedFields
})
    .min(1)
    .unknown(false);

export {
    createEventSchema,
    updateEventSchema
};
