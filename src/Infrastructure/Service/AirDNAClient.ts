import * as _ from 'lodash';
import * as request from 'request-promise';
import * as url from 'url';
import Cache from '../../Domain/Service/Cache';
import Property from '../../Domain/Model/Property/Property';
import Settings from '../../Settings';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../Types';

@injectable()
export default class AirDNAClient {
    private httpClient: any;
    private readonly token: string;
    private baseUrl = 'https://api.airdna.co';

    constructor(
        @inject(TYPES.Cache) private cache: Cache,
    ) {
        this.token = Settings.get('airdna')['access_token'];
        this.httpClient = request;
    }

    async findByProperty(property: Property): Promise<any> {
        const cacheKey = `airdna-property-${property.getId()}`;
        if (await this.cache.has(cacheKey)) {
            return (await this.cache.get(cacheKey)).response;
        }

        const address = `${property.getStreet()} ${property.getCity()} ${property.getState()}`;

        const response = await this.getRentReportSummary(
            address,
            property.getBedrooms(),
            property.getBathrooms(),
        );

        if (
            !response.property_stats ||
            (response.property_stats && !response.property_stats.occupancy)
        ) {
            throw new Error(`Invalid AirDNA response - Property ${property.getId()}`);
        }

        await this.cache.put(cacheKey, {
            payload: {
                zillowId: property.getZillowId(),
                address: address,
                bedrooms: property.getBedrooms(),
                bathrooms: property.getBathrooms(),
            },
            response,
        });

        return response;
    }

    private async getRentReportSummary(
        address: string,
        bedrooms?: number,
        bathrooms?: number,
        accommodates?: number,
    ) {
        const requestURL = new url.URL('/client/v1/rentalizer/ltm', this.baseUrl);
        const access_token = this.token;
        const qs: { [key: string]: any } = {
            access_token: access_token,
            address: address,
            currency: 'usd',
        };

        if (bedrooms) {
            qs.bedrooms = bedrooms;
        }

        if (bathrooms) {
            qs.bathrooms = bathrooms;
        }

        if (accommodates) {
            qs.accommodates = accommodates;
        }

        return this.httpClient.get({
            uri: requestURL.toString(),
            qs,
            json: true,
        });
    }
}
