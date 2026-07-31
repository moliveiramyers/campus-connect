import { Router } from "express";
import userRouter from "./users.js";
import venueRouter from "./venues.js";
import swaggerUi from "swagger-ui-express";
import {createRequire} from "module";

const router = Router();

const require = createRequire(import.meta.url);
const swaggerDocument = require("../../swagger.json");

router.get("/", (req, res) => {
    res.send('Welcome to the Campus Connect API!')
});

router.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

router.use("/users", userRouter);
router.use("/venues", venueRouter);

export default router;