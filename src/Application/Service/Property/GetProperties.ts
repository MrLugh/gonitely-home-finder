import Property from '../../../Domain/Model/Property/Property';
import PropertyRepository from '../../../Domain/Model/Property/PropertyRepository';
import SearchResource from '../../../Domain/Model/Common/SearchResult';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../Types';
import Query from '../../../Domain/Model/Common/Query';

interface Request {
    query: Query;
}

@injectable()
export default class GetProperties {
    constructor(
        @inject(TYPES.PropertyRepository) private propertyRepository: PropertyRepository,
    ) {}

    async execute(request: Request): Promise<SearchResource<Property>> {
        return await this.propertyRepository.search(request.query);
    }
}
