import Point from '../Common/Point';
import OpportunityZone from './OpportunityZone';
import Query from '../Common/Query';
import SearchResource from '../Common/SearchResult';

export default interface OpportunityZoneRepository {
    findOneByPoint(point: Point): Promise<OpportunityZone | undefined>;
    getZips(): Promise<string[]>;
    search(query: Query): Promise<SearchResource<OpportunityZone>>;
}
