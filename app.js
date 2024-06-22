require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();
const connectDB = require("./db/connect");
//extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
app.set("trust proxy", 1);
//middlewares
app.use(
    rateLimiter.rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100,
    })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

// routers
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const userAuthentication = require("./middleware/authentication");

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", [userAuthentication, jobsRouter]);

app.get("/", (req, res) => {
    res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
});
// Options for swagger-jsdoc
// Swagger ui
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//errors
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
