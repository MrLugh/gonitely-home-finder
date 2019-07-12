import NotFoundError from '../../../Domain/Exception/NotFoundError';
import Query from '../../../Domain/Model/Common/Query';
import SearchResource from '../../../Domain/Model/Common/SearchResult';
import { injectable } from 'inversify';
import JsonApiQuery from '../../Service/JsonApiQuery';

interface Entity {
    getId(): string;
}

@injectable()
export default abstract class InMemoryRepository<T extends Entity> {
    protected entities: { [id: string]: T } = {};

    async findById(id: string): Promise<T | undefined> {
        return await this.entities[id];
    }

    async findByIdOrFail(id: string): Promise<T> {
        const entity = await this.findById(id);
        if (!entity) {
            throw this.notFoundError();
        }

        return entity;
    }

    async find(query: Query): Promise<T[]> {
        const result: T[] = [];

        return Object.keys(this.entities).reduce((acc, key) => {
            acc = acc.concat(this.entities[key]);
            return acc;
        }, result);
    }

    async findAll(): Promise<T[]> {
        return await this.find(new JsonApiQuery());
    }

    async save(entity: T): Promise<T> {
        this.entities[entity.getId()] = entity;

        return await entity;
    }

    async delete(entity: T): Promise<void> {
        delete this.entities[entity.getId()];

        return await undefined;
    }

    async total(): Promise<number> {
        return await Object.keys(this.entities).length;
    }

    clear(): void {
        this.entities = {};
    }

    notFoundError(): NotFoundError {
        return new NotFoundError();
    }
}
