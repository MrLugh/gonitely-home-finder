import Property from '../../Domain/Model/Property/Property';
import { IndexDocumentParams } from 'elasticsearch';

export default class PropertyDocument {
    public static readonly ES_INDEX = 'properties';
    public static readonly ES_TYPE = 'property';

    constructor(private property: Property) {}

    serialize(): IndexDocumentParams<any> {
        return {
            index: PropertyDocument.ES_INDEX,
            type: PropertyDocument.ES_TYPE,
            id: this.property.getId(),
            body: {
                zillowId: this.property.getZillowId(),
                street: this.property.getStreet(),
                country: this.property.getCountry(),
                state: this.property.getState(),
                county: this.property.getCounty(),
                city: this.property.getCity(),
                zip: this.property.getZip(),
                price: this.property.getPrice(),
                zEstimate: this.property.getZEstimate(),
                taxRate: this.property.getTaxRate(),
                occupancyRate: this.property.getOccupancyRate(),
                averageDailyRate: this.property.getAverageDailyRate(),
                dailyRevenue: this.property.getRevenue(),
                bedrooms: this.property.getBedrooms(),
                bathrooms: this.property.getBathrooms(),
                sqft: this.property.getSquareFeet(),
                year: this.property.getYear(),
                picture: this.property.getPicture(),
                pictures: this.property.getPictures(),
                mortgageData: this.property.getMortgageData(),
                location: {
                    lat: this.property.getLatitude(),
                    lon: this.property.getLongitude(),
                },
                isOpportunityZone: this.property.getOpportunityZoneId() ? true : false,
            },
        };
    }
}
