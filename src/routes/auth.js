import { Router } from 'express';

import passport, { githubOAuthConfigured } from '../config/passport.js';
import { ServiceUnavailableError } from '../utils/error.js';

const router = Router();

const requireGitHubConfiguration = (req, res, next) => {
    if (!githubOAuthConfigured) {
        return next(new ServiceUnavailableError(
            'GitHub OAuth is not configured on this server.'
        ));
    }

    next();
};

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
    passport.authenticate('github', { scope: ['user:email'] })
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
    passport.authenticate('github', { failureRedirect: '/auth/failure' }),
    (req, res) => {
        res.redirect(process.env.OAUTH_SUCCESS_REDIRECT || '/api-docs');
    }
);

router.get('/status', (req, res) => {
    /*
        #swagger.tags = ['Authentication']
        #swagger.description = 'Return the current OAuth session status.'
        #swagger.responses[200] = { description: 'Current authentication status.' }
    */
    res.status(200).json({
        authenticated: req.isAuthenticated?.() || false,
        user: req.user || null
    });
});

router.get('/failure', (req, res) => {
    /* #swagger.ignore = true */
    res.status(401).json({
        status: 'fail',
        message: 'GitHub authentication failed.'
    });
});

router.get('/logout', (req, res, next) => {
    /*
        #swagger.tags = ['Authentication']
        #swagger.description = 'End the current OAuth session.'
        #swagger.responses[200] = { description: 'Logout completed.' }
    */
    req.logout((error) => {
        if (error) {
            return next(error);
        }

        req.session.destroy((sessionError) => {
            if (sessionError) {
                return next(sessionError);
            }

            res.clearCookie('campus.connect.sid');
            res.status(200).json({ message: 'Logged out successfully.' });
        });
    });
});

export default router;
