import express from 'express';

import * as user from '../controllers/users.js';
import validate from '../middleware/validate.js';
import {
    createUserSchema,
    updateUserSchema
} from '../validators/validateUsers.js';
import validateID from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', user.getAllUsers);
router.get('/:id', validateID, user.getUserById);
router.post('/', validate(createUserSchema), user.createUser);
router.post('/register', validate(createUserSchema), user.createUser);
router.put('/:id', validateID, validate(updateUserSchema), user.updateUser);
router.delete('/:id', validateID, user.deleteUser);

export default router;
