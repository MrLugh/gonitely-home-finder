import Location from '../../../Domain/Model/Location/Location';
import LocationRepository from '../../../Domain/Model/Location/LocationRepository';
import Query from '../../../Domain/Model/Common/Query';
import SearchResource from '../../../Domain/Model/Common/SearchResult';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../Types';

interface Request {
    query: Query;
}
@injectable()
export default class GetLocations {
    constructor(
        @inject(TYPES.LocationRepository) private LocationRepository: LocationRepository,
    ) {}

    async execute(request: Request): Promise<SearchResource<Location>> {
        return await this.LocationRepository.search(request.query);
    }
}
