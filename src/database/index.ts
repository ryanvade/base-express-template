import { createConnection, getRepository, Repository, Connection } from "typeorm";
import { Logger } from "winston";
import { Container } from "inversify";

import { User } from "./entities/User";
export { User };

export async function createDatabaseConnection(logger: Logger): Promise<Connection | null> {
    logger.debug("Creating a database connection");
    logger.debug(__dirname);
    let entityPath = __dirname + "/entities/*.js";
    if (Boolean(process.env.LOCAL)) {
        entityPath = __dirname + "/entities/*.ts";
    }
    logger.debug(entityPath);
    try {
        return await createConnection({
            type: "postgres",
            host: process.env.DB_HOST || "",
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USER || "",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME || "",
            logging: !!process.env.DB_LOGGING || process.env.NODE_ENV !== "production",
            entities: [entityPath]
        });
    } catch (error) {
        logger.error(`Unable to establish database connection: ${error}`);
        process.exit(1);
    }
    return null;
}

export function registerRepositories(logger: Logger, container: Container) {
    logger.debug("Registering Typeorm Repositories");
    const userRepository = getRepository<User>(User);
    container.bind<Repository<User>>("UserRepository").toConstantValue(userRepository);
}