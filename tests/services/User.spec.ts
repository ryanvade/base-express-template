import { expect } from "chai";
import { Container } from "inversify";
import { UserService } from "../../src/services";
import { bindings } from "../../src/inversify.config";
import { repositories } from "../../src/database";
import { services } from "../../src/services";
import * as dotenv from "dotenv";

const result = dotenv.config({ path: __dirname + "/../.env.test", debug: true });
console.log(result);


describe("User Service", () => {
    let container: Container;

    beforeEach(async () => {
        container = new Container();
        await container.loadAsync(bindings);
        container.load(repositories);
        container.load(services);
    });

    it("can paginate users", async () => {
        const service = container.get<UserService>("UserService");
        expect(service).not.to.be.undefined;
    });
});