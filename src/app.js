import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';

dotenv.config();

import cors from 'cors';

import passport from './config/passport.js';
import { NotFoundError } from './utils/error.js';
import errorHandler from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET;
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (isProduction && !sessionSecret) {
    throw new Error('SESSION_SECRET is required when NODE_ENV is production.');
}

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionOptions = {
    name: 'campus.connect.sid',
    secret: sessionSecret || 'development-only-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
    cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
};

if (isProduction && mongoUri) {
    sessionOptions.store = MongoStore.create({
        mongoUrl: mongoUri,
        dbName: 'campus-connect',
        collectionName: 'sessions',
        crypto: { secret: sessionSecret },
        touchAfter: 24 * 60 * 60
    });
}

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

app.use((req, res, next) => {
    next(new NotFoundError(`Can't find ${req.originalUrl} on this server`));
});

app.use(errorHandler);

export default app;
