import { AsyncContainerModule, interfaces } from "inversify";
import { createDatabaseConnection } from "./database";
import { createLogger, transports, format, Logger } from "winston";

export const bindings = new AsyncContainerModule(async (bind: interfaces.Bind) => {
    // Setup Logging
    const logger = createLogger({
        level: process.env.LOGGING_LEVEL || process.env.NODE_ENV == "production" ? "info" : "debug",
        transports: [
            new transports.Console({ format: format.cli() })
        ]
    });
    bind<Logger>("Logger").toConstantValue(logger);

    // Setup Database Connections
    const connection = await createDatabaseConnection(logger);
    logger.debug(`Database Connection: ${connection}`);
    logger.debug(`Database is Connected: ${connection?.isConnected}`);
    logger.debug(`Databse Connection: ${connection?.name}`);
});