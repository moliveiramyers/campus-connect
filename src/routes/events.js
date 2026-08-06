import express from 'express';

import * as event from '../controllers/events.js';
import validate from '../middleware/validate.js';
import validateID from '../middleware/validateObjectId.js';
import {
    createEventSchema,
    updateEventSchema
} from '../validators/validateEvents.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get(
    '/',
    /*
        #swagger.tags = ['Events']
        #swagger.description = 'Get all events. Supports category, status, venueId, organizerId, from, and to filters.'
        #swagger.parameters['category'] = { in: 'query', type: 'string', required: false }
        #swagger.parameters['status'] = { in: 'query', type: 'string', required: false, enum: ['draft', 'published', 'cancelled', 'completed'] }
        #swagger.parameters['venueId'] = { in: 'query', type: 'string', required: false }
        #swagger.parameters['organizerId'] = { in: 'query', type: 'string', required: false }
        #swagger.parameters['from'] = { in: 'query', type: 'string', format: 'date-time', required: false }
        #swagger.parameters['to'] = { in: 'query', type: 'string', format: 'date-time', required: false }
        #swagger.responses[200] = { description: 'List of events.' }
        #swagger.responses[400] = { description: 'Invalid filter value.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    event.getAllEvents
);

router.get(
    '/:id',
    /*
        #swagger.tags = ['Events']
        #swagger.description = 'Get an event by its ID.'
        #swagger.parameters['id'] = { in: 'path', description: 'Event ID', required: true, type: 'string' }
        #swagger.responses[200] = { description: 'Event found successfully.' }
        #swagger.responses[400] = { description: 'Invalid MongoDB ObjectId.' }
        #swagger.responses[404] = { description: 'Event not found.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    validateID,
    event.getEventById
);

router.post(
    '/',
    /*
        #swagger.tags = ['Events']
        #swagger.description = 'Create a new event.'
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: { $ref: '#/definitions/Event' }
        }
        #swagger.responses[201] = { description: 'Event created successfully.' }
        #swagger.responses[400] = { description: 'Request validation failed.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    requireAuth,
    requireRole({ roles: ['admin'] }),
    validate(createEventSchema),
    event.createEvent
);

router.put(
    '/:id',
    /*
        #swagger.tags = ['Events']
        #swagger.description = 'Update one or more fields on an event.'
        #swagger.parameters['id'] = { in: 'path', description: 'Event ID', required: true, type: 'string' }
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: { $ref: '#/definitions/EventUpdate' }
        }
        #swagger.responses[200] = { description: 'Event updated successfully.' }
        #swagger.responses[400] = { description: 'Invalid ID or request body.' }
        #swagger.responses[404] = { description: 'Event not found.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    requireAuth,
    requireRole({ roles: ['admin'] }),
    validateID,
    validate(updateEventSchema),
    event.updateEvent
);

router.delete(
    '/:id',
    /*
        #swagger.tags = ['Events']
        #swagger.description = 'Delete an event.'
        #swagger.parameters['id'] = { in: 'path', description: 'Event ID', required: true, type: 'string' }
        #swagger.responses[200] = { description: 'Event deleted successfully.' }
        #swagger.responses[400] = { description: 'Invalid MongoDB ObjectId.' }
        #swagger.responses[404] = { description: 'Event not found.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    requireAuth,
    requireRole({ roles: ['admin'] }),
    validateID,
    event.deleteEvent
);

export default router;
