import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import validateID from "../middleware/validateObjectId.js";
import {
    createVenueSchema,
    updateVenueSchema,
} from "../validators/validateVenue.js";
import {
    getAllVenues,
    getVenueById,
    createVenue,
    updateVenue,
    deleteVenue,
} from "../controllers/venues.js";

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
    getAllVenues
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
    getVenueById
);

router.post(
    "/",
    /*
        #swagger.tags = ['Venues']
        #swagger.description = 'Create a new venue.'
        #swagger.security = [{ "githubOAuth": [] }]

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
    validate(createVenueSchema),
    createVenue
);

router.put(
    "/:id",
    /*
        #swagger.tags = ['Venues']
        #swagger.description = 'Update an existing venue.'
        #swagger.security = [{ "githubOAuth": [] }]

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
    validateID,
    validate(updateVenueSchema),
    updateVenue
);

router.delete(
    "/:id",
    /*
        #swagger.tags = ['Venues']
        #swagger.description = 'Deactivate a venue (soft delete).'
        #swagger.security = [{ "githubOAuth": [] }]

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
    validateID,
    deleteVenue
);

export default router;
