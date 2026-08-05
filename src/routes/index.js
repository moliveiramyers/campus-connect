import { Router } from 'express';
import { createRequire } from 'module';
import swaggerUi from 'swagger-ui-express';

import authRouter from './auth.js';
import eventRouter from './events.js';
import registrationRouter from './registrations.js';
import userRouter from './users.js';
import venueRouter from './venues.js';

const router = Router();

const require = createRequire(import.meta.url);
const swaggerDocument = require('../../swagger.json');

const requestSwaggerDocument = (req) => ({
    ...swaggerDocument,
    host: req.get('host'),
    schemes: [req.protocol]
});

router.get('/', (req, res) => {
    /* #swagger.ignore = true */
    res.status(200).json({
        name: 'Campus Connect API',
        status: 'ok',
        documentation: '/api-docs',
        swagger: '/swagger.json',
        authentication: {
            login: '/auth/github',
            status: '/auth/status',
            logout: '/auth/logout'
        }
    });
});

router.get('/swagger.json', (req, res) => {
    /* #swagger.ignore = true */
    res.status(200).json(requestSwaggerDocument(req));
});

router.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(null, {
        swaggerOptions: {
            url: '/swagger.json'
        }
    })
);

router.use('/users', userRouter);
router.use('/events', eventRouter);
router.use('/venues', venueRouter);
router.use('/registrations', registrationRouter);
router.use('/auth', authRouter);

export default router;
