import Location from '../../Domain/Model/Location/Location';
import { IndexDocumentParams } from 'elasticsearch';

export default class LocationDocument {
    public static readonly ES_INDEX = 'locations';
    public static readonly ES_TYPE = 'location';

    constructor(private location: Location) {}

    serialize(): IndexDocumentParams<any> {
        return {
            index: LocationDocument.ES_INDEX,
            type: LocationDocument.ES_TYPE,
            id: this.location.getId(),
            body: {
                country: this.location.getCountry(),
                state: this.location.getState(),
                city: this.location.getCity(),
                county: this.location.getCounty(),
                zip: this.location.getZip(),
                street: this.location.getStreet(),
                description: this.location.getDescription(),
                type: this.location.getType(),
            },
        };
    }
}
