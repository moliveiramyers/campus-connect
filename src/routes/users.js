import express from 'express';

import * as user from '../controllers/users.js';
import validate from '../middleware/validate.js';
import {
    adminCreateUserSchema,
    adminUpdateUserSchema,
    publicUpdateUserSchema
} from '../validators/validateUsers.js';
import validateID from '../middleware/validateObjectId.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/',
    /*
        #swagger.tags = ['Users']
        #swagger.description = 'Get all users.'

        #swagger.responses[200] = {
            description: 'List of all users.'
        }

        #swagger.responses[500] = {
            description: 'Unexpected server error.'
        }
    */
    requireAuth,
    requireRole({ roles: ['admin'] }),
    user.getAllUsers
);
    
router.get('/:id',
    /*
       #swagger.tags = ['Users']
       #swagger.description = 'Get a user by its ID.'

       #swagger.parameters['id'] = {
           in: 'path',
           description: 'User ID',
           required: true,
           type: 'string'
       }

       #swagger.responses[200] = {
           description: 'User found successfully.'
       }

       #swagger.responses[404] = {
           description: 'User not found.'
       }

       #swagger.responses[400] = {
           description: 'Invalid MongoDB ObjectId.'
       }

       #swagger.responses[500] = {
           description: 'Unexpected server error.'
       }
   */
    requireAuth,
    requireRole({ roles: ['admin'], allowSelf: true }),
    validateID,
    user.getUserById
);
    
router.post('/',
    /*
      #swagger.tags = ['Users']
      #swagger.description = 'Register a new user.'

      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
              $ref: '#/definitions/User'
          }
      }

      #swagger.responses[201] = {
          description: 'User created successfully.'
      }

      #swagger.responses[400] = {
          description: 'Request validation failed.'
      }

      #swagger.responses[409] = {
          description: 'A user with the submitted email already exists.'
      }

      #swagger.responses[500] = {
          description: 'Unexpected server error.'
      }
  */
    requireAuth,
    requireRole({ roles: ['admin'] }),
    validate(adminCreateUserSchema),
    user.createUser);

router.put('/:id',
    /*
       #swagger.tags = ['Users']
       #swagger.description = 'Update an existing user.'

       #swagger.parameters['id'] = {
           in: 'path',
           description: 'User ID',
           required: true,
           type: 'string'
       }

       #swagger.parameters['body'] = {
           in: 'body',
           required: true,
           schema: {
               $ref: '#/definitions/UserUpdate'
           }
       }

       #swagger.responses[200] = {
           description: 'User updated successfully.'
       }

       #swagger.responses[404] = {
           description: 'User not found.'
       }

       #swagger.responses[400] = {
           description: 'Invalid ID or request body.'
       }

       #swagger.responses[409] = {
           description: 'The updated email is already in use.'
       }

       #swagger.responses[500] = {
           description: 'Unexpected server error.'
       }
   */
    requireAuth,
    requireRole({ roles: ['admin'], allowSelf: true }),
    validateID,
    validate(req => req.user.role === 'admin'
        ? adminUpdateUserSchema
        : publicUpdateUserSchema
    ),
    user.updateUser
);

router.delete('/:id',
    /*
       #swagger.tags = ['Users']
       #swagger.description = 'Delete a user.'

       #swagger.parameters['id'] = {
           in: 'path',
           description: 'User ID',
           required: true,
           type: 'string'
       }

       #swagger.responses[200] = {
           description: 'User deleted successfully.'
       }

       #swagger.responses[404] = {
           description: 'User not found.'
       }

       #swagger.responses[400] = {
           description: 'Invalid MongoDB ObjectId.'
       }

       #swagger.responses[500] = {
           description: 'Unexpected server error.'
       }
   */
    requireAuth,
    requireRole({ roles: ['admin'] }),
    validateID,
    user.deleteUser);

export default router;
