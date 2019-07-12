export default interface RemoteProperty {
    remoteId: string;
    provider: string;
    country: string;
    state: string;
    city: string;
    county: string;
    zip: string;
    street: string;
    price: number;
    homeStatus: string;
    homeType: string;
    zEstimate: number;
    taxRate: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    year: number;
    latitude: number;
    longitude: number;
    picture: string | undefined;
    pictures: string[];
    mortgageData: any;
}
