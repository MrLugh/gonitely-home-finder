import Property from '../../Domain/Model/Property/Property';

export default class PropertySerializer {
    constructor(private property: Property) {}

    serialize() {
        return {
            id: this.property.getId(),
            country: this.property.getCountry(),
            state: this.property.getState(),
            county: this.property.getCounty(),
            city: this.property.getCity(),
            zip: this.property.getZip(),
            street: this.property.getStreet(),
            price: this.property.getPrice(),
            propertyTax: parseFloat(this.property.getTaxValue().toFixed(2)),
            managementFee: parseFloat(Number(Math.max(this.property.getRevenue() * 365 * 0.25, 0)).toFixed(2)),
            suppliesCost: this.property.getBedrooms() * 50 * 12,
            maintenanceCost: this.property.getPrice() * 0.01,
            bedrooms: this.property.getBedrooms(),
            bathrooms: this.property.getBathrooms(),
            sqft: this.property.getSquareFeet(),
            year: this.property.getYear(),
            latitude: this.property.getLatitude(),
            longitude: this.property.getLongitude(),
            picture: this.property.getPicture(),
            pictures: this.property.getPictures(),
            score: this.property.getScore(),
            capRate: this.property.getCapRate(),
            cashOnCashReturn: this.property.getCashOnCashReturn(),
            occupancyRate: parseInt(Number(this.property.getOccupancyRate() * 100).toFixed(0)),
            averageDailyRate: parseFloat(Number(this.property.getAverageDailyRate()).toFixed(2)),
            revenue: parseFloat(Number(this.property.getRevenue()).toFixed(2)),
            rentalInfoProviders: this.property.rentalInfoProviders(),
            isOpportunityZone: this.property.getOpportunityZoneId() ? true : false,
        };
    }
}
