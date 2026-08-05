import 'dotenv/config';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';

import User from '../models/users.js';

const githubOAuthConfigured = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
);

const getCallbackUrl = () => {
    if (process.env.GITHUB_CALLBACK_URL) {
        return process.env.GITHUB_CALLBACK_URL;
    }

    if (process.env.RENDER_EXTERNAL_HOSTNAME) {
        return `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/auth/github/callback`;
    }

    const port = process.env.PORT || 8080;
    return `http://localhost:${port}/auth/github/callback`;
};

if (githubOAuthConfigured) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: getCallbackUrl(),
                state: true
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({
                        authMethods: {
                            $elemMatch: {
                                provider: 'github',
                                providerId: profile.id
                            }
                        }
                    });

                    if (!user) {
                        const email = profile.emails?.[0]?.value?.toLowerCase()
                            || `${profile.username || profile.id}@users.noreply.github.com`;

                        user = await User.findOne({ email });

                        if (user) {
                            user.authMethods.push({
                                provider: 'github',
                                providerId: profile.id
                            });
                            if (!user.profileImage && profile.photos?.[0]?.value) {
                                user.profileImage = profile.photos[0].value;
                            }
                            await user.save();
                        } else {
                            user = await User.create({
                                name: profile.displayName || profile.username || 'GitHub User',
                                email,
                                profileImage: profile.photos?.[0]?.value,
                                authMethods: [{
                                    provider: 'github',
                                    providerId: profile.id
                                }]
                            });
                        }
                    }

                    done(null, user);
                } catch (error) {
                    done(error);
                }
            }
        )
    );
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user || false);
    } catch (error) {
        done(error);
    }
});

export {
    githubOAuthConfigured,
    getCallbackUrl
};

export default passport;
