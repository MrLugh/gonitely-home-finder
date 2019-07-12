import Property from './Property';
import Query from '../Common/Query';
import SearchResource from '../Common/SearchResult';

export default interface PropertyRepository {
    findByIdOrFail(id: string): Promise<Property>;
    findByRemoteId(remoteId: string): Promise<Property | undefined>;
    findAll(): Promise<Property[]>;
    findZipsInOpportunityZones(): Promise<string[]>;
    search(query: Query): Promise<SearchResource<Property>>;
    searchById(id: string, query: Query): Promise<Property>;
    save(property: Property): Promise<Property>;
    total(): Promise<number>;
    delete(property: Property): Promise<void>;
}