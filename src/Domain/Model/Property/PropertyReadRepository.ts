import Property from './Property';
import Query from '../Common/Query';
import SearchResource from '../Common/SearchResult';
import PropertySearchResult from './PropertySearchResult';

export default interface PropertyReadRepository {
    delete(property: Property): Promise<void>;
    save(property: Property): Promise<Property>;
    saveMany(properties: Property[]): Promise<Property[]>;
    search(query: Query): Promise<SearchResource<PropertySearchResult>>;
}
