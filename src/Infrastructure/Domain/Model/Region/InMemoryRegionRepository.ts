import InMemoryRepository from '../InMemoryRepository';
import Query from '../../../../Domain/Model/Common/Query';
import Region from '../../../../Domain/Model/Region/Region';
import RegionRepository from '../../../../Domain/Model/Region/RegionRepository';
import SearchResource from '../../../../Domain/Model/Common/SearchResult';
import { injectable } from 'inversify';

@injectable()
export default class InMemoryRegionRepository extends InMemoryRepository<Region> implements RegionRepository {
    constructor() {
        super();
    }

    async findByRemoteId(remoteId: string): Promise<Region | undefined> {
        for (const propertyId of Object.keys(this.entities)) {
            const property = this.entities[propertyId];
            if (remoteId == property.getZillowId()) {
                return property;
            }
        }

        return undefined;
    }

    async findZipsByCity(city: string, state: string): Promise<Region[]> {
        return await [];
    }

    async findZipsByState(state: string): Promise<Region[]> {
        return await [];
    }

    async getStates(): Promise<string[]> {
        return await [];
    }

    async getZipsByCity(city: string, state: string): Promise<string[]> {
        return await [];
    }

    async getZipsByState(state: string): Promise<string[]> {
        return await [];
    }

    async findByZip(zip: string): Promise<Region | undefined> {
        return await undefined;
    }

    async findByCity(city: string): Promise<Region | undefined> {
        return await undefined;
    }

    async search(query: Query): Promise<SearchResource<Region>> {
        return new SearchResource(
            await this.find(query),
            Object.keys(this.entities).length
        );
    }
}
