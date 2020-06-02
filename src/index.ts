import "reflect-metadata";
import bodyParser from "body-parser";
import morgan from "morgan";
import * as dotenv from "dotenv";
import { Container } from "inversify";
import { repositories } from "./database";
import { services } from "./services";
import { InversifyExpressServer } from "inversify-express-utils";
import { Logger } from "winston";
import { bindings } from "./inversify.config";

// Parse .env file if it exists
dotenv.config({ debug: process.env.NODE_ENV != "production" });


import "./controllers/Example";
import "./controllers/User";

(async () => {
    // Setup Inversify Container
    const container = new Container();
    await container.loadAsync(bindings);
    container.load(repositories);
    container.load(services);

    // Setup the Express Server with Inversify
    let server = new InversifyExpressServer(container);
    server.setConfig((app) => {
        app.use(morgan("combined"));
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
    });

    // Start the Server
    const app = server.build();
    const PORT = Number(process.env.EXPRESS_PORT || 3000);
    app.listen(PORT, () => {
        const logger = container.get<Logger>("Logger");
        logger.info(`Application listening on port ${PORT}`);
    });
})();