import { Router } from 'express';

import * as registration from '../controllers/registrations.js';
import requireAuth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import validateID from '../middleware/validateObjectId.js';
import {
    createRegistrationSchema,
    updateRegistrationSchema
} from '../validators/validateRegistrations.js';

const router = Router();

router.get(
    '/',
    /*
        #swagger.tags = ['Registrations']
        #swagger.description = 'Get all registrations. Supports userId, eventId, and status filters.'
        #swagger.parameters['userId'] = { in: 'query', type: 'string', required: false }
        #swagger.parameters['eventId'] = { in: 'query', type: 'string', required: false }
        #swagger.parameters['status'] = { in: 'query', type: 'string', required: false, enum: ['registered', 'waitlisted', 'cancelled', 'attended'] }
        #swagger.responses[200] = { description: 'List of registrations.' }
        #swagger.responses[400] = { description: 'Invalid filter value.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    registration.getAllRegistrations
);

router.get(
    '/:id',
    /*
        #swagger.tags = ['Registrations']
        #swagger.description = 'Get a registration by its ID.'
        #swagger.parameters['id'] = { in: 'path', description: 'Registration ID', required: true, type: 'string' }
        #swagger.responses[200] = { description: 'Registration found successfully.' }
        #swagger.responses[400] = { description: 'Invalid MongoDB ObjectId.' }
        #swagger.responses[404] = { description: 'Registration not found.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    validateID,
    registration.getRegistrationById
);

router.post(
    '/',
    /*
        #swagger.tags = ['Registrations']
        #swagger.description = 'Create a registration. Requires an authenticated GitHub session.'
        #swagger.security = [{ "githubOAuth": [] }]
        #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Registration' } }
        #swagger.responses[201] = { description: 'Registration created successfully.' }
        #swagger.responses[400] = { description: 'Request validation failed.' }
        #swagger.responses[401] = { description: 'Authentication required.' }
        #swagger.responses[409] = { description: 'This user is already registered for this event.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    requireAuth,
    validate(createRegistrationSchema),
    registration.createRegistration
);

router.put(
    '/:id',
    /*
        #swagger.tags = ['Registrations']
        #swagger.description = 'Update a registration. Requires an authenticated GitHub session.'
        #swagger.security = [{ "githubOAuth": [] }]
        #swagger.parameters['id'] = { in: 'path', description: 'Registration ID', required: true, type: 'string' }
        #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/RegistrationUpdate' } }
        #swagger.responses[200] = { description: 'Registration updated successfully.' }
        #swagger.responses[400] = { description: 'Invalid ID or request body.' }
        #swagger.responses[401] = { description: 'Authentication required.' }
        #swagger.responses[404] = { description: 'Registration not found.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    requireAuth,
    validateID,
    validate(updateRegistrationSchema),
    registration.updateRegistration
);

router.delete(
    '/:id',
    /*
        #swagger.tags = ['Registrations']
        #swagger.description = 'Delete a registration. Requires an authenticated GitHub session.'
        #swagger.security = [{ "githubOAuth": [] }]
        #swagger.parameters['id'] = { in: 'path', description: 'Registration ID', required: true, type: 'string' }
        #swagger.responses[200] = { description: 'Registration deleted successfully.' }
        #swagger.responses[400] = { description: 'Invalid MongoDB ObjectId.' }
        #swagger.responses[401] = { description: 'Authentication required.' }
        #swagger.responses[404] = { description: 'Registration not found.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    requireAuth,
    validateID,
    registration.deleteRegistration
);

export default router;
