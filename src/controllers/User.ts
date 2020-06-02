import {
    controller, httpGet, BaseHttpController, httpPost, requestBody, requestParam, httpDelete, httpPatch
} from "inversify-express-utils";
import { inject } from "inversify";
import { Logger } from "winston";
import { Repository } from "typeorm";
import { User } from "../database";
import * as Joi from "@hapi/joi";

export interface UserCreateBody {
    email: string,
    firstName: string,
    lastName: string
}

export interface UserUpdateBody {
    firstName?: string,
    lastName?: string
}

@controller("/users")
export class UsersController extends BaseHttpController {
    @inject("Logger") private readonly _logger: Logger;
    @inject("UserRepository") private readonly _repository: Repository<User>;

    @httpGet("/")
    public async list() {
        this._logger.debug("Start GET /users");
        try {
            const users = await this._repository.find({ skip: 0, take: 10 });
            this._logger.debug(`Users: ${users}`);
            return this.json({
                "status": "ok",
                "entities": users
            });
        } catch (error) {
            this._logger.error(`Unable to list users: ${error}`);
            return this.internalServerError();
        }
    }

    @httpGet("/:id")
    public async get(@requestParam("id") id: number) {
        this._logger.debug(`ID: ${id}`);
        try {
            const user = await this._repository.findOne(id);
            if (!user) {
                return this.notFound();
            }
            return this.json({
                "status": "ok",
                "entity": user
            });
        } catch (error) {
            this._logger.error(`Unable to list users: ${error}`);
            return this.internalServerError();
        }
    }

    @httpPost("/")
    public async create(@requestBody() body: UserCreateBody) {
        this._logger.debug(JSON.stringify(body));
        const schema = Joi.object({
            email: Joi.string().email().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required()
        });
        const { error, errors } = schema.validate(body);
        this._logger.debug(JSON.stringify(error));
        this._logger.debug(JSON.stringify(errors));

        if (error || errors) {
            return this.json({
                "status": "error",
                "error": error || errors
            }, 400);
        }

        try {
            const user = await this._repository.save(body);
            return this.json({
                "status": "ok",
                "entity": user
            });
        } catch (error) {
            this._logger.error(`Unable to create user: ${error}`);
            return this.internalServerError();
        }
    }

    @httpDelete("/:id")
    public async delete(@requestParam("id") id: number) {
        this._logger.debug(`ID: ${id}`);
        try {
            const result = await this._repository.delete(id);
            if (!result.affected) {
                return this.notFound();
            }
            return this.json({
                "status": "ok"
            });
        } catch (error) {
            this._logger.error(`Unable to delete user: ${error}`);
            return this.internalServerError();
        }
    }

    @httpPatch("/:id")
    public async update(@requestParam("id") id: number, @requestBody() body: UserUpdateBody) {
        this._logger.debug(JSON.stringify(body));
        const schema = Joi.object({
            firstName: Joi.string(),
            lastName: Joi.string()
        }).or("firstName", "lastName");
        const { error, errors } = schema.validate(body);
        this._logger.debug(JSON.stringify(error));
        this._logger.debug(JSON.stringify(errors));

        if (error || errors) {
            return this.json({
                "status": "error",
                "error": error || errors
            }, 400);
        }

        try {
            const updateResponse = await this._repository.update(id, body);
            if (!updateResponse.affected) {
                return this.notFound();
            }
            const user = await this._repository.findOne(id);
            return this.json({
                "status": "ok",
                "entity": user
            });
        } catch (error) {
            this._logger.error(`Unable to update user: ${error}`);
            return this.internalServerError();
        }
    }
}