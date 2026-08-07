import { Router } from 'express';
import requireGitHubConfiguration from '../middleware/githubConfig.js';
import * as authController from '../controllers/auth.js';
import validate from '../middleware/validate.js';
import { publicCreateUserSchema, authLoginSchema } from '../validators/validateUsers.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get(
    '/github',
    /*
        #swagger.tags = ['Authentication']
        #swagger.description = 'Start the GitHub OAuth login flow.'
        #swagger.produces = ['text/html']
        #swagger.responses[302] = { description: 'Redirect to GitHub for authentication.' }
        #swagger.responses[503] = { description: 'OAuth environment variables are not configured.' }
    */
    requireGitHubConfiguration,
    authController.gitHubOauth
);

router.get(
    '/github/callback',
    /*
        #swagger.tags = ['Authentication']
        #swagger.description = 'GitHub OAuth callback. GitHub redirects the user here after authorization.'
        #swagger.parameters['code'] = { in: 'query', type: 'string', required: true }
        #swagger.responses[302] = { description: 'Authentication succeeded; redirect to Swagger UI.' }
        #swagger.responses[401] = { description: 'GitHub authentication failed.' }
    */
    requireGitHubConfiguration,
    authController.gitHubCallback
);

router.get('/status',
    /*
        #swagger.tags = ['Authentication']
        #swagger.description = 'Return the current OAuth session status.'
        #swagger.responses[200] = { description: 'Current authentication status.' }
    */
    authController.getAuthStatus
);

router.post(
    '/register',
    /*
      #swagger.tags = ['Authentication']
      #swagger.description = 'Register a new user with email, password, name, and optional profile image.'
      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
              $ref: '#/definitions/NewUser'
          }
      }
      #swagger.responses[201] = { description: 'User registered successfully.' }
      #swagger.responses[400] = { description: 'Request validation failed.' }
      #swagger.responses[409] = { description: 'A user with this email already exists.' }
    */
    validate(publicCreateUserSchema),
    authController.registerLocalUser
);

router.post(
    '/login',
    /*
      #swagger.tags = ['Authentication']
      #swagger.description = 'Log in with local credentials and establish a session.'
      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
                $ref: '#/definitions/LoginRequest'
              }
          }
      }
      #swagger.responses[200] = { description: 'Login successful.' }
      #swagger.responses[401] = { description: 'Invalid email or password.' }
      #swagger.responses[400] = { description: 'Request validation failed.' }
    */
    validate(authLoginSchema),
    authController.loginLocalUser
);

router.get('/logout',
    /*
        #swagger.tags = ['Authentication']
        #swagger.description = 'End the current OAuth session.'
        #swagger.security = [{ "sessionAuth": [] }]
        #swagger.responses[200] = { description: 'Logout completed.' }
    */
    requireAuth,
    authController.logoutUser
);

export default router;
