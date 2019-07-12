import InMemoryRepository from '../InMemoryRepository';
import Location from '../../../../Domain/Model/Location/Location';
import LocationRepository from '../../../../Domain/Model/Location/LocationRepository';
import Property from '../../../../Domain/Model/Property/Property';
import Query from '../../../../Domain/Model/Common/Query';
import SearchResource from '../../../../Domain/Model/Common/SearchResult';
import { injectable } from 'inversify';

@injectable()
export default class InMemoryLocationRepository extends InMemoryRepository<Location> implements LocationRepository {
    constructor() {
        super();
    }

    async search(query: Query): Promise<SearchResource<Location>> {
        return new SearchResource(
            await this.find(query),
            Object.keys(this.entities).length
        );
    }

    async saveFromProperty(property: Property): Promise<void> {
        await this.save(
            new Location(
                property.getCountry(),
                property.getState(),
                property.getCounty(),
                property.getCity(),
                property.getZip(),
                property.getStreet(),
            )
        );
    }
}
