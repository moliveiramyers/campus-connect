import { UnauthorizedError } from '../utils/error.js';
import { createLocalUser, authenticateLocalUser } from '../services/userService.js';
import passport from '../config/passport.js';

const gitHubOauth = passport.authenticate('github', { scope: ['user:email'] });

const gitHubCallback = [
    passport.authenticate('github',{ failWithError: true }),
    (req, res) => {
        res.redirect(process.env.OAUTH_SUCCESS_REDIRECT || '/api-docs');
    },
    (err, req, res, next) => {
        next(new UnauthorizedError('GitHub authentication failed'));
    }
];

const getAuthStatus = (req, res) => {
    res.status(200).json({
        authenticated: req.isAuthenticated?.() || false,
        user: req.user || null
    });
}

const registerLocalUser = async (req, res, next) => {
    try {
        const newUser = await createLocalUser(req.body);

        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};

const loginLocalUser = async (req, res, next) => {
    try {
        const user = await authenticateLocalUser(req.body);

        req.login(user, (error) => {
            if (error) {
                return next(error);
            }

            res.status(200).json(user);
        });
    } catch (error) {
        next(error);
    }
};

const logoutUser = (req, res, next) => {
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
};

export {
    gitHubOauth,
    gitHubCallback,
    getAuthStatus,
    logoutUser,
    registerLocalUser,
    loginLocalUser
};