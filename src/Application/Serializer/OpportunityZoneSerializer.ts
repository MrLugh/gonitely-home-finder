import OpportunityZone from '../../Domain/Model/OpportunityZone/OpportunityZone';

export default class OpportunityZoneSerializer {
    constructor(private opportunityZone: OpportunityZone) {
    }

    serialize() {
        return {
            id: this.opportunityZone.getId(),
            zip: this.opportunityZone.getZip(),
            geometry: this.opportunityZone.getGeometry(),
        };
    }
}
