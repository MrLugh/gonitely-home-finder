interface IndexedProperty {
    id: string;
    zillowId: string;
    country: string;
    state: string;
    county: string;
    city: string;
    zip: string;
    street: string;
    price: number;
    zEstimate: number;
    taxRate: number;
    occupancyRate: number;
    averageDailyRate: number;
    dailyRevenue: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    year: number;
    location: {
        lat: number;
        lon: number;
    };
    picture: string;
    pictures: string[];
    mortgageData: any;
    isOpportunityZone: boolean;
}
