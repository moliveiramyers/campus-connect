import express from 'express';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

import cors from 'cors';

import { NotFoundError } from './utils/error.js';
import errorHandler from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();
const swaggerDocument = JSON.parse(
    readFileSync(new URL('../swagger.json', import.meta.url), 'utf8')
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Set up routes */
app.use('/', routes);

app.use((req, res, next) => {
    next(new NotFoundError(`Can't find ${req.originalUrl} on this server`));
});

app.use(errorHandler);

export default app;
