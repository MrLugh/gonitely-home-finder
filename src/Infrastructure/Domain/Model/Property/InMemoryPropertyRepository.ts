import InMemoryRepository from '../InMemoryRepository';
import Property from '../../../../Domain/Model/Property/Property';
import PropertyRepository from '../../../../Domain/Model/Property/PropertyRepository';
import Query from '../../../../Domain/Model/Common/Query';
import SearchResource from '../../../../Domain/Model/Common/SearchResult';
import { injectable } from 'inversify';

@injectable()
export default class InMemoryPropertyRepository extends InMemoryRepository<Property> implements PropertyRepository {
    constructor() {
        super();
    }

    async findByRemoteId(remoteId: string): Promise<Property | undefined> {
        for (const propertyId of Object.keys(this.entities)) {
            const property = this.entities[propertyId];
            if (remoteId == property.getZillowId()) {
                return property;
            }
        }

        return undefined;
    }

    async search(query: Query): Promise<SearchResource<Property>> {
        return new SearchResource(
            await this.find(query),
            Object.keys(this.entities).length
        );
    }

    async searchById(id: string, query: Query): Promise<Property> {
        return await this.findByIdOrFail(id);
    }

    async delete(property: Property): Promise<void> {
        return await undefined;
    }

    async findZipsInOpportunityZones(): Promise<string[]> {
        return await [];
    }
}
