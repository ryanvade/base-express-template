import { expect } from "chai";
import { Container } from "inversify";
import { UserService } from "../../src/services";
import { bindings } from "../../src/inversify.config";
import { repositories, User } from "../../src/database";
import { services } from "../../src/services";
import * as dotenv from "dotenv";
import { Repository } from "typeorm";
import * as faker from "faker";

const result = dotenv.config({ path: __dirname + "/../.env.test", debug: true });
console.log(result);


describe("User Service", async () => {
    let container: Container;

    beforeEach(async () => {
        container = new Container();
        await container.loadAsync(bindings);
        container.load(repositories);
        container.load(services);
    });

    it("can paginate users", async () => {
        // Given a copy of the service
        const service = container.get<UserService>("UserService");
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // Call the service and get a response
        const response = await service.paginate();
        // Expect the response to contain all of the users
        expect(response.entities.length).to.be.eq(users.length);
        // Expect the total to be the same as all users in the database
        expect(response.total).to.be.eq(users.length);
    });

    it("can skip a number of users when paginating", async () => {
        // Given a copy of the service
        const service = container.get<UserService>("UserService");
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // Call the service and get a response
        const response = await service.paginate(10, 5);
        // Expect the response to contain all of the users
        expect(response.entities.length).to.be.eq(users.length - 5);
        // Expect the total to be the same as all users in the database
        expect(response.total).to.be.eq(users.length);
    });

    it("can take a number of users when paginating", async () => {
        // Given a copy of the service
        const service = container.get<UserService>("UserService");
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // Call the service and get a response
        const response = await service.paginate(2);
        // Expect the response to contain all of the users
        expect(response.entities.length).to.be.eq(2);
        // Expect the total to be the same as all users in the database
        expect(response.total).to.be.eq(users.length);
    });

    it("can get a user by an id", async () => {
        // Given a copy of the service
        const service = container.get<UserService>("UserService");
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // And one user to fetch
        const user = users[0];
        // Call the service and get a response
        const response = await service.get(user.id);
        // expect the response to be the existing user
        expect(response).to.deep.eq(user);
    });

    it("returns null when getting a user by id that doesn't exist", async () => {
        // Given a copy of the service
        const service = container.get<UserService>("UserService");
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // And one user to fetch
        const user = users[users.length - 1];
        // Call the service and get a response
        const response = await service.get(user.id + 1);
        // expect the response to be the existing user
        expect(response).to.eq(null);
    });

    it("can create a user", async () => {
        // Given a copy of the service
        const service = container.get<UserService>("UserService");
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some props
        const props = {
            email: faker.internet.email(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        };
        // Call the service and get a response
        const response = await service.create(props);
        // expect the response to have the same email
        expect(response.email).to.eq(props.email);
        // expect the response to have the same firstName
        expect(response?.firstName).to.eq(props.firstName);
        // expect the response to have the same lastName
        expect(response?.lastName).to.eq(props.lastName);
        // Get the user from the database
        const userInDatabase = await repository.findOne(response.id);
        // expect the user to exist
        expect(userInDatabase).not.to.be.undefined;
    });

    it("can update a user", async () => {
        // Given a copy of the service
        const service = container.get<UserService>("UserService");
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // And one user to fetch
        const user = users[0];
        // And some updates
        const props = {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        };
        // Call the function and get a response
        const response = await service.update(user.id, props);
        // expect the response not to be null
        expect(response).not.to.be.null;
        // expect the firstname to have changed
        expect(response?.firstName).to.eq(props.firstName);
        // expect the lastname to have changed
        expect(response?.lastName).to.eq(props.lastName);
        // get the user from the database
        const userInDatabase = await repository.findOne(user.id);
        // expect the userInDatabase not to be null
        expect(userInDatabase).not.to.be.undefined;
        // expect the firstname to have changed
        expect(userInDatabase?.firstName).to.eq(props.firstName);
        // expect the lastname to have changed
        expect(userInDatabase?.lastName).to.eq(props.lastName);
    });

    it("can delete a user", async () => {
        // Given a copy of the service
        const service = container.get<UserService>("UserService");
        // And a repository
        const repository = container.get<Repository<User>>("UserRepository");
        // And some users in the database
        const users = await createUsers(repository);
        // And one user to fetch
        const user = users[0];
        // Call the function and get a response
        const response = await service.delete(user.id);
        // expect the response to be true
        expect(response).to.be.true;
        // try and get the user from the database
        const userInDatabase = await repository.findOne(user.id);
        // expect the user to not exist
        expect(userInDatabase).to.be.undefined;
    })

    afterEach(async () => {
        const repository = container.get<Repository<User>>("UserRepository");
        await clearUsers(repository);
    });
});


async function createUsers(repository: Repository<User>, count: number = 10) {
    let users = [];
    for(let i = 0; i < count; i++) {
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