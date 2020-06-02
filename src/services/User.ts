import { BaseEntityService, PaginationResponse } from "./BaseEntityService";
import { User } from "../database/entities/User";
import { inject, injectable } from "inversify";
import { Repository } from "typeorm";

@injectable()
export class UserService extends BaseEntityService<User> {

    constructor(@inject("UserRepository") repository: Repository<User>) {
        super(repository);
    }

    public async paginate(take: number = 10, skip: number = 0): Promise<PaginationResponse<User>> {
        const [entities, total] = await this._repository.findAndCount({
            take,
            skip
        });
        return {
            entities,
            total
        };
    }

    public async get(id: string | number): Promise<User | null> {
        return await this._repository.findOne(id) || null;
    }

    public async create(props: Partial<User>): Promise<User> {
        return await this._repository.save({
            firstName: props.firstName || "",
            lastName: props.lastName || "",
            email: props.email || ""
        });
    }

    public async update(id: string | number, props: Partial<User>): Promise<User | null> {
        const updateResponse = await this._repository.update(id, {
            firstName: props.firstName,
            lastName: props.lastName
        });
        if (!updateResponse.affected) {
            return null;
        }
        return await this._repository.findOne(id) || null;
    }

    public async delete(id: string | number): Promise<boolean> {
        return !!await this._repository.delete(id);
    }

}