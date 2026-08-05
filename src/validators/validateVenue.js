import Joi from 'joi';

const createVenueSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(255)
        .required(),

    venueType: Joi.string()
        .valid('in-person', 'online')
        .required(),

    meetingLink: Joi.string()
        .trim()
        .uri()
        .max(2048)
        .when('venueType', {
            is: 'online',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),

    building: Joi.string()
        .trim()
        .min(1)
        .max(255)
        .when('venueType', {
            is: 'in-person',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),

    room: Joi.string()
        .trim()
        .min(1)
        .max(255)
        .when('venueType', {
            is: 'in-person',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),

    address: Joi.string()
        .trim()
        .min(1)
        .max(255)
        .when('venueType', {
            is: 'in-person',
            then: Joi.required(),
            otherwise: Joi.optional(),
        }),

    capacity: Joi.number()
        .integer()
        .min(1)
        .required(),

    accessibilityNotes: Joi.string()
        .trim()
        .max(500)
        .optional(),
});

const updateVenueSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(255),

    venueType: Joi.string()
        .valid('in-person', 'online'),

    meetingLink: Joi.string()
        .trim()
        .uri()
        .max(2048),

    building: Joi.string()
        .trim()
        .min(1)
        .max(255),

    room: Joi.string()
        .trim()
        .min(1)
        .max(255),

    address: Joi.string()
        .trim()
        .min(1)
        .max(255),

    capacity: Joi.number()
        .integer()
        .min(1),

    accessibilityNotes: Joi.string()
        .trim()
        .max(500),
})
    .min(1)
    .unknown(false)
    .custom((value, helpers) => {
        if (value.venueType === 'online' && !value.meetingLink) {
            return helpers.message({
                custom: 'meetingLink is required when venueType is online'
            });
        }

        if (value.venueType === 'in-person') {
            const missingField = ['building', 'room', 'address']
                .find((field) => !value[field]);

            if (missingField) {
                return helpers.message({
                    custom:
                        `${missingField} is required when venueType is in-person`
                });
            }
        }

        return value;
    });

export { createVenueSchema, updateVenueSchema };
