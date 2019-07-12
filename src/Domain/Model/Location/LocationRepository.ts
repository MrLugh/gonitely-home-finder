import Location from './Location';
import Property from '../Property/Property';
import Query from '../Common/Query';
import SearchResource from '../Common/SearchResult';

export default interface LocationRepository {
    search(query: Query): Promise<SearchResource<Location>>;
    save(location: Location): Promise<Location>;
    saveFromProperty(property: Property): Promise<void>;
}
