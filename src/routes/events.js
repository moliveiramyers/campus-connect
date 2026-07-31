import express from 'express';

import * as event from '../controllers/events.js';
import validate from '../middleware/validate.js';
import validateID from '../middleware/validateObjectId.js';
import {
    createEventSchema,
    updateEventSchema
} from '../validators/validateEvents.js';

const router = express.Router();

router.get('/', event.getAllEvents);
router.get('/:id', validateID, event.getEventById);
router.post('/', validate(createEventSchema), event.createEvent);
router.put('/:id', validateID, validate(updateEventSchema), event.updateEvent);
router.delete('/:id', validateID, event.deleteEvent);

export default router;
