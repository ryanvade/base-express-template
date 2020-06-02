import { expect } from "chai";
import { Container } from "inversify";
import { bindings } from "../../src/inversify.config";
import { repositories, User } from "../../src/database";
import { services } from "../../src/services";
import * as dotenv from "dotenv";
import "../../src/controllers/User";
import { InversifyExpressServer } from "inversify-express-utils";
import supertest from "supertest";
import { Repository } from "typeorm";
import * as faker from "faker";
import bodyParser from "body-parser";


const result = dotenv.config({ path: __dirname + "/../.env.test", debug: true });
console.log(result);


describe("Users Controller", async () => {
    let container: Container;
    let server: InversifyExpressServer;

    beforeEach(async () => {
        container = new Container();
        await container.loadAsync(bindings);
        container.load(repositories);
        container.load(services);
        server = new InversifyExpressServer(container);
        server.setConfig(app => {
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(bodyParser.json());
        })
    });

    it("can list users", async () => {
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // Call the server and check the response
        await supertest(server.build())
            .get("/users")
            .expect("Content-Type", /json/)
            .then((response) => {
                const body = response.body;
                expect(body.status).to.eq("ok");
                expect(body.total).to.eq(users.length);
                expect(body.entities.length).to.eq(10);
            });
    });

    it("can skip users in the list", async () => {
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // Call the server and check the response
        await supertest(server.build())
            .get("/users?skip=5")
            .expect("Content-Type", /json/)
            .then((response) => {
                const body = response.body;
                expect(body.status).to.eq("ok");
                expect(body.total).to.eq(users.length);
                expect(body.entities.length).to.eq(users.length - 5);
            });
    });

    it("can take users in the list", async () => {
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // Call the server and check the response
        await supertest(server.build())
            .get("/users?take=2")
            .expect("Content-Type", /json/)
            .then((response) => {
                const body = response.body;
                expect(body.status).to.eq("ok");
                expect(body.total).to.eq(users.length);
                expect(body.entities.length).to.eq(2);
            });
    });

    it("can get a user by ID", async () => {
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // And a user
        const user = users[0];
        // Call the server and check the response
        await supertest(server.build())
            .get("/users/" + user.id)
            .expect("Content-Type", /json/)
            .then((response) => {
                const body = response.body;
                expect(body.status).to.eq("ok");
                expect(body.entity).to.deep.eq(user);
            });
    });

    it("returns 404 for a non-existant user id", async () => {
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // And a user
        const user = users[users.length - 1];
        // Call the server and check the response
        await supertest(server.build())
            .get("/users/" + user.id + 1)
            .then((response) => {
                expect(response.status).to.eq(404);
            });
    });

    it("can create a user", async () => {
        // Given a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some props for the new user
        const props = {
            email: faker.internet.email(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        };
        await supertest(server.build())
            .post("/users")
            .send(props)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200)
            .then(async (response) => {
                expect(response.body.entity).not.to.be.undefined;
                expect(response.body.entity.email).to.eq(props.email);
                expect(response.body.entity.firstName).to.eq(props.firstName);
                expect(response.body.entity.lastName).to.eq(props.lastName);
                const userInDatabase = await repository.findOne(response.body.entity.id);
                expect(userInDatabase).not.to.be.undefined;
            });
    });

    // TODO: Update and Delete Tests here...

    afterEach(async () => {
        const repository = container.get<Repository<User>>("UserRepository");
        await clearUsers(repository);
    });
});

async function createUsers(repository: Repository<User>, count: number = 10) {
    let users = [];
    for (let i = 0; i < count; i++) {
        let props: Partial<User> = {
            email: faker.internet.email(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        };
        let user = await repository.save(props);
        users.push(user);
    }
    return users;
}

async function clearUsers(repository: Repository<User>) {
    await repository.clear();
}