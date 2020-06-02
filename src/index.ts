import "reflect-metadata";
import bodyParser from "body-parser";
import morgan from "morgan";
import * as dotenv from "dotenv";

import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import { createLogger, transports, format, Logger } from "winston";
import { createDatabaseConnection, registerRepositories } from "./database";

// Parse .env file if it exists
dotenv.config({ debug: process.env.NODE_ENV != "production" });

const logger = createLogger({
    level: process.env.LOGGING_LEVEL || process.env.NODE_ENV == "production" ? "info" : "debug",
    transports: [
        new transports.Console({ format: format.cli() })
    ]
});

import "./controllers/Example";
import "./controllers/User";
import { Connection } from "typeorm";

createDatabaseConnection(logger).then(async (connection: Connection | null) => {

    logger.debug(`Database Connection: ${connection}`);
    logger.debug(`Database is Connected: ${connection?.isConnected}`);
    logger.debug(`Databse Connection: ${connection?.name}`);

    let container = new Container();
    container.bind<Logger>("Logger").toConstantValue(logger);
    registerRepositories(logger, container);
    
    let server = new InversifyExpressServer(container);
    server.setConfig((app) => {
        app.use(morgan("combined"));
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
    });
    
    const app = server.build();
    const PORT = Number(process.env.EXPRESS_PORT || 3000);
    app.listen(PORT, async () => {
        logger.info(`Application started on port ${PORT}`);
    });
}).catch(error => {
    logger.error(`App Startup Error: ${error}`);
    process.exit(1);
});
