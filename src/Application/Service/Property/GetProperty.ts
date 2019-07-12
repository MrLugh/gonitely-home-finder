import Property from '../../../Domain/Model/Property/Property';
import PropertyRepository from '../../../Domain/Model/Property/PropertyRepository';
import Query from '../../../Domain/Model/Common/Query';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../Types';

interface Request {
    id: string;
    query: Query;
}

@injectable()
export default class GetProperty {
    constructor(
        @inject(TYPES.PropertyRepository) private propertyRepository: PropertyRepository,
    ) {}

    async execute(request: Request): Promise<Property> {
        return await this.propertyRepository.searchById(request.id, request.query);
    }
}
