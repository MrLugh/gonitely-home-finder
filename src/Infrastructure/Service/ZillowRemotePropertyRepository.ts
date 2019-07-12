import RegionRepository from '../../Domain/Model/Region/RegionRepository';
import RemoteProperty from '../../Domain/Model/Property/RemoteProperty';
import RemotePropertyRepository from '../../Domain/Model/Property/RemotePropertyRepository';
import ZillowClient from './ZillowClient';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../Types';

@injectable()
export default class ZillowRemotePropertyRepository implements RemotePropertyRepository {
    private client: typeof ZillowClient;

    constructor(
        @inject(TYPES.RegionRepository) private regionRepository: RegionRepository,
    ) {
        this.client = ZillowClient;
    }

    async findById(id: string): Promise<RemoteProperty> {
        const response: any = await this.client.findPropertyById(id);

        const propertyData = response.data.property;
        const pictures: [{ url: string }] = propertyData.hugePhotos || propertyData.photos;

        const remoteProperty: RemoteProperty = {
            remoteId: propertyData.zpid,
            provider: 'zillow',
            country: 'US',
            state: propertyData.address.state,
            county: propertyData.county,
            city: propertyData.address.city,
            zip: propertyData.address.zipcode,
            street: propertyData.address.streetAddress,
            price: propertyData.price,
            homeStatus: propertyData.homeStatus.toLowerCase(),
            homeType: propertyData.homeType.toLowerCase(),
            zEstimate: propertyData.zestimate,
            taxRate: propertyData.propertyTaxRate,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            sqft: propertyData.livingArea,
            year: propertyData.yearBuilt,
            latitude: propertyData.latitude,
            longitude: propertyData.longitude,
            picture: pictures && pictures.length ? pictures[0].url : undefined,
            pictures: pictures.map(photo => photo.url),
            mortgageData: propertyData.mortgageData,
        };

        return remoteProperty;
    }

    async findIdsByZip(zip: string): Promise<string[]> {
        const region = await this.regionRepository.findByZip(zip);
        if ( ! region) {
            throw new Error('Region not found');
        }

        return await this.client.findPropertyIdsByRegion(region);
    }

    async findIdsByCity(city: string): Promise<string[]> {
        const region = await this.regionRepository.findByCity(city);
        if ( ! region) {
            throw new Error('Region not found');
        }

        return await this.client.findPropertyIdsByRegion(region);
    }
}
