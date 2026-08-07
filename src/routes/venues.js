import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import validateID from "../middleware/validateObjectId.js";
import {
    createVenueSchema,
    updateVenueSchema,
} from "../validators/validateVenue.js";
import * as venue from "../controllers/venues.js";

const router = Router();

router.get(
    "/",
    /*
        #swagger.tags = ['Venues']
        #swagger.description = 'Get all active venues.'
        #swagger.responses[200] = {
            description: 'List of active venues.'
        }

        #swagger.responses[500] = {
            description: 'Unexpected server error.'
        }
    */
    venue.getAllVenues
);

router.get(
    "/:id",
    /*
        #swagger.tags = ['Venues']
        #swagger.description = 'Get a venue by its ID.'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'Venue ID',
            required: true,
            type: 'string'
        }

        #swagger.responses[200] = {
            description: 'Venue found successfully.'
        }

        #swagger.responses[404] = {
            description: 'Venue not found.'
        }

        #swagger.responses[400] = {
            description: 'Invalid MongoDB ObjectId.'
        }

        #swagger.responses[500] = {
            description: 'Unexpected server error.'
        }
    */
    validateID,
    venue.getVenueById
);

router.post(
    "/",
    /*
        #swagger.tags = ['Venues']
        #swagger.description = 'Create a new venue.'
        #swagger.security = [{ "sessionAuth": [] }]

        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {
                $ref: '#/definitions/InPersonVenue'
            }
        }

        #swagger.responses[201] = {
            description: 'Venue created successfully.'
        }

        #swagger.responses[400] = {
            description: 'Request validation failed.'
        }

        #swagger.responses[401] = {
            description: 'Authentication required.'
        }

        #swagger.responses[500] = {
            description: 'Unexpected server error.'
        }
    */
    requireAuth,
    requireRole({ roles: ["admin"] }),
    validate(createVenueSchema),
    venue.createVenue
);

router.put(
    "/:id",
    /*
        #swagger.tags = ['Venues']
        #swagger.description = 'Update an existing venue.'
        #swagger.security = [{ "sessionAuth": [] }]

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'Venue ID',
            required: true,
            type: 'string'
        }

        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {
                $ref: '#/definitions/VenueUpdate'
            }
        }

        #swagger.responses[200] = {
            description: 'Venue updated successfully.'
        }

        #swagger.responses[404] = {
            description: 'Venue not found.'
        }

        #swagger.responses[400] = {
            description: 'Invalid ID or request body.'
        }

        #swagger.responses[401] = {
            description: 'Authentication required.'
        }

        #swagger.responses[500] = {
            description: 'Unexpected server error.'
        }
    */
    requireAuth,
    requireRole({ roles: ["admin"] }),
    validateID,
    validate(updateVenueSchema),
    venue.updateVenue
);

router.delete(
    "/:id",
    /*
        #swagger.tags = ['Venues']
        #swagger.description = 'Deactivate a venue (soft delete).'
        #swagger.security = [{ "sessionAuth": [] }]

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'Venue ID',
            required: true,
            type: 'string'
        }

        #swagger.responses[200] = {
            description: 'Venue deactivated successfully.'
        }

        #swagger.responses[404] = {
            description: 'Venue not found.'
        }

        #swagger.responses[400] = {
            description: 'Invalid MongoDB ObjectId.'
        }

        #swagger.responses[401] = {
            description: 'Authentication required.'
        }

        #swagger.responses[500] = {
            description: 'Unexpected server error.'
        }
    */
    requireAuth,
    requireRole({ roles: ["admin"] }),
    validateID,
    venue.deleteVenue
);

export default router;
