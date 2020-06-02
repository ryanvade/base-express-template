import { User } from "../database";
import { UserService } from "./User";
import { ContainerModule, interfaces } from "inversify";
import { BaseEntityService } from "./BaseEntityService";
export { BaseEntityService, UserService };

export const services = new ContainerModule((bind: interfaces.Bind) => {
    bind<BaseEntityService<User>>("UserService").to(UserService).inRequestScope();
});