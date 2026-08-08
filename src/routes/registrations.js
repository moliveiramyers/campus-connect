import { Router } from 'express';

import * as registration from '../controllers/registrations.js';
import { requireAuth, requireRole, authorizeRegistrationOwner } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import validateID from '../middleware/validateObjectId.js';
import {
    createRegistrationSchema,
    createAdminRegistrationSchema,
    updateRegistrationSchema,
    updateAdminRegistrationSchema
} from '../validators/validateRegistrations.js';

const router = Router();

router.get(
    '/',
    /*
        #swagger.tags = ['Registrations']
        #swagger.description = 'Get all registrations. Supports userId, eventId, and status filters. Requires an authenticated session with admin privileges.'
        #swagger.parameters['userId'] = { in: 'query', type: 'string', required: false }
        #swagger.parameters['eventId'] = { in: 'query', type: 'string', required: false }
        #swagger.parameters['status'] = { in: 'query', type: 'string', required: false, enum: ['registered', 'waitlisted', 'cancelled', 'attended'] }
        #swagger.responses[200] = { description: 'List of registrations.' }
        #swagger.responses[400] = { description: 'Invalid filter value.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    requireAuth,
    requireRole({ roles: ['admin'] }),
    registration.getAllRegistrations
);

router.get(
    '/:id',
    /*
        #swagger.tags = ['Registrations']
        #swagger.description = 'Get a registration by its ID. Requires an authenticated session with admin privileges or the owner of the registration.'
        #swagger.parameters['id'] = { in: 'path', description: 'Registration ID', required: true, type: 'string' }
        #swagger.responses[200] = { description: 'Registration found successfully.' }
        #swagger.responses[400] = { description: 'Invalid MongoDB ObjectId.' }
        #swagger.responses[404] = { description: 'Registration not found.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    requireAuth,
    validateID,
    authorizeRegistrationOwner,
    registration.getRegistrationById
);

router.post(
    '/',
    /*
        #swagger.tags = ['Registrations']
        #swagger.description = 'Create a registration. Requires an authenticated session. Regular users may register themselves; administrators may create a registration for any user by providing userId.'
        #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Registration' } }
        #swagger.responses[201] = { description: 'Registration created successfully.' }
        #swagger.responses[400] = { description: 'Request validation failed.' }
        #swagger.responses[401] = { description: 'Authentication required.' }
        #swagger.responses[403] = { description: 'User does not have permission to create this registration.' }
        #swagger.responses[409] = { description: 'This user is already registered for this event.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    requireAuth,
    validate((req) => (
        req.user.role === 'admin'
            ? createAdminRegistrationSchema
            : createRegistrationSchema
    )),
    registration.createRegistration
);

router.put(
    '/:id',
    /*
        #swagger.tags = ['Registrations']
        #swagger.description = 'Update a registration. Requires an authenticated session. Administrators may update any registration, including userId; registration owners may update only their own registration details.'
        #swagger.parameters['id'] = { in: 'path', description: 'Registration ID', required: true, type: 'string' }
        #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/RegistrationUpdate' } }
        #swagger.responses[200] = { description: 'Registration updated successfully.' }
        #swagger.responses[400] = { description: 'Invalid ID or request body.' }
        #swagger.responses[401] = { description: 'Authentication required.' }
        #swagger.responses[403] = { description: 'User does not have permission to update this registration.' }
        #swagger.responses[404] = { description: 'Registration not found.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    requireAuth,
    validateID,
    authorizeRegistrationOwner,
    validate((req) => (
        req.user.role === 'admin'
            ? updateAdminRegistrationSchema
            : updateRegistrationSchema
    )),
    registration.updateRegistration
);

router.delete(
    '/:id',
    /*
        #swagger.tags = ['Registrations']
        #swagger.description = 'Delete a registration. Requires an authenticated session; administrators or the registration owner may perform this action.'
        #swagger.parameters['id'] = { in: 'path', description: 'Registration ID', required: true, type: 'string' }
        #swagger.responses[200] = { description: 'Registration deleted successfully.' }
        #swagger.responses[400] = { description: 'Invalid MongoDB ObjectId.' }
        #swagger.responses[401] = { description: 'Authentication required.' }
        #swagger.responses[403] = { description: 'User does not have permission to delete this registration.' }
        #swagger.responses[404] = { description: 'Registration not found.' }
        #swagger.responses[500] = { description: 'Unexpected server error.' }
    */
    requireAuth,
    validateID,
    authorizeRegistrationOwner,
    registration.deleteRegistration
);

export default router;