import { expect } from "chai";
import { Container } from "inversify";
import { bindings } from "../../src/inversify.config";
import { repositories } from "../../src/database";
import { services } from "../../src/services";
import * as dotenv from "dotenv";
import "../../src/controllers/Example";
import { InversifyExpressServer } from "inversify-express-utils";
import supertest from "supertest";

const result = dotenv.config({ path: __dirname + "/../.env.test", debug: true });
console.log(result);


describe("Example Controller", async () => {
    let container: Container;
    let server: InversifyExpressServer;

    beforeEach(async () => {
        container = new Container();
        await container.loadAsync(bindings);
        container.load(repositories);
        container.load(services);
        server = new InversifyExpressServer(container);
    });

    it("responds with OK", async () => {
        supertest(server.build())
            .get("/")
            .expect("Content-Type", /json/)
            .end((err, response) => {
                if (!err) {
                    const body = response.body;
                    expect(body.status).to.eq("OK");
                }
            });
    });
});