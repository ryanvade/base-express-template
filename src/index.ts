import "reflect-metadata";
import bodyParser from "body-parser";
import morgan from "morgan";

import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import { createLogger, transports, format, Logger } from "winston";

import "./controllers/Example";

let container = new Container();

const logger = createLogger({
    level: process.env.NODE_ENV == "production"? "info" : "debug",
    transports: [
        new transports.Console({ format: format.cli() })
    ]
});

container.bind<Logger>("Logger").toConstantValue(logger);

let server = new InversifyExpressServer(container);
server.setConfig((app) => {
    app.use(morgan("combined"));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
});

const app = server.build();
app.listen(3000, () => {
    logger.info("Application started on port 3000");
});