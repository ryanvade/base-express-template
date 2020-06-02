import { createConnection, getRepository, Repository, Connection, getConnectionManager } from "typeorm";
import { Logger } from "winston";
import { ContainerModule, interfaces } from "inversify";

import { User } from "./entities/User";
export { User };

export async function createDatabaseConnection(logger: Logger): Promise<Connection | null> {
    logger.debug("Creating a database connection");
    logger.debug(__dirname);
    let entityPath = __dirname + "/entities/*.js";
    if (Boolean(process.env.LOCAL) || process.env.NODE_ENV == "test") {
        entityPath = __dirname + "/entities/*.ts";
    }
    logger.debug(entityPath);
    const manager = getConnectionManager();
    if (manager.has("default")) {
        return manager.get("default");
    } else {
        try {
            return await createConnection({
                type: "postgres",
                host: process.env.DB_HOST || "",
                port: Number(process.env.DB_PORT) || 5432,
                username: process.env.DB_USER || "",
                password: process.env.DB_PASSWORD || "",
                logging: Boolean(process.env.DB_LOGGING),
                entities: [entityPath],
                synchronize: process.env.NODE_ENV == "test",
                schema: process.env.DB_SCHEMA || "",
                database: process.env.DB_NAME || ""
            });
        } catch (error) {
            logger.error(`Unable to establish database connection: ${error}`);
            process.exit(1);
        }
        return null;
    }
}

export const repositories = new ContainerModule((bind: interfaces.Bind) => {
    bind<Repository<User>>("UserRepository").toDynamicValue(() => getRepository<User>(User)).inRequestScope();
});