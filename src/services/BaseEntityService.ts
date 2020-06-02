import { Repository } from "typeorm";
import { injectable } from "inversify";

export interface PaginationResponse<T> {
    entities: T[];
    total: number;
}

@injectable()
export abstract class BaseEntityService<T> {
    protected _repository: Repository<T>;

    constructor(repository: Repository<T>) {
        this._repository = repository;
    }

    abstract async paginate(take?: number, skip?: number): Promise<PaginationResponse<T>>;

    abstract async get(id: number | string): Promise<T | null>;

    abstract async create(props: Partial<T>): Promise<T>;

    abstract async update(id: number | string, props: Partial<T>): Promise<T | null>;

    abstract async delete(id: number | string): Promise<boolean>;
}