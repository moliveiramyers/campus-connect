import express from 'express';

import * as user from '../controllers/users.js';
import validate from '../middleware/validate.js';
import userSchema from '../validators/validateUsers.js';
import validateID from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/', user.getAllUsers);
router.get('/:id', validateID, user.getUserById);
router.post('/register', validate(userSchema), user.createUser);
router.put('/:id', validateID, validate(userSchema), user.updateUser);
router.delete('/:id', validateID, user.deleteUser);

export default router;