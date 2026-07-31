import express from 'express';

import * as user from '../controllers/users.js';
import validate from '../middleware/validate.js';
import userSchema from '../validators/validateUsers.js';
import validateID from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/',
    /*
        #swagger.tags = ['Users']
        #swagger.description = 'Get all users.'

        #swagger.responses[200] = {
            description: 'List of all users.'
        }
    */
    user.getAllUsers);
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
   */
    validateID, user.getUserById);
    
router.post('/register',
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
  */
    validate(userSchema), user.createUser);

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
   */
    validateID, validate(userSchema), user.updateUser);

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
   */
    validateID, user.deleteUser);

export default router;