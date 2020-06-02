import { User } from "../database";
import { UserService } from "./User";
import { Container } from "inversify";
import { BaseEntityService } from "./BaseEntityService";
export { BaseEntityService, UserService };

export function registerServices(container: Container) {
    container.bind<BaseEntityService<User>>("UserService").to(UserService);
}