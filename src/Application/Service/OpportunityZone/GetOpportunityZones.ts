import OpportunityZone from '../../../Domain/Model/OpportunityZone/OpportunityZone';
import OpportunityZoneRepository from '../../../Domain/Model/OpportunityZone/OpportunityZoneRepository';
import SearchResource from '../../../Domain/Model/Common/SearchResult';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../Types';
import Query from '../../../Domain/Model/Common/Query';

interface Request {
    query: Query;
}
@injectable()
export default class GetOpportunityZones {
    constructor(
        @inject(TYPES.OpportunityZoneRepository) private opportunityZoneRepository: OpportunityZoneRepository,
    ) {}

    async execute(request: Request): Promise<SearchResource<OpportunityZone>> {
        return await this.opportunityZoneRepository.search(request.query);
    }
}
