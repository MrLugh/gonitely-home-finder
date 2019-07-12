import Location from '../../Domain/Model/Location/Location';

export default class LocationSerializer {
    constructor(private location: Location) { }

    serialize() {
        return {
            id: this.location.getId(),
            country: this.location.getCountry(),
            state: this.location.getState(),
            county: this.location.getCounty(),
            city: this.location.getCity(),
            zip: this.location.getZip(),
            street: this.location.getStreet(),
            type: this.location.getType(),
            description: this.location.getDescription(),
        };
    }
}
