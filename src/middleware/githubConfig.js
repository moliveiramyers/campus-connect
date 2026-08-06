import { ServiceUnavailableError } from '../utils/error.js';
import { githubOAuthConfigured } from '../config/passport.js';

const requireGitHubConfiguration = (req, res, next) => {
    if (!githubOAuthConfigured) {
        return next(new ServiceUnavailableError(
            'GitHub OAuth is not configured on this server.'
        ));
    }

    next();
};

export default requireGitHubConfiguration;