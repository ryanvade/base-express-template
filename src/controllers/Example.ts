import {
    controller, httpGet, BaseHttpController
} from "inversify-express-utils";
import { inject } from "inversify";
import { Logger } from "winston";

@controller("/")
export class ExampleController extends BaseHttpController {

    @inject("Logger") private readonly _logger: Logger;

    @httpGet("/")
    public async get() {
        this._logger.debug("GET Example Controller");
        return this.json({ "status": "OK" });
    }
}