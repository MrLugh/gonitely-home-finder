import * as request from 'request-promise';
import * as url from 'url';
import Cache from '../../Domain/Service/Cache';
import Property from '../../Domain/Model/Property/Property';
import Settings from '../../Settings';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../Types';

@injectable()
export default class AttomClient {
    private baseUrl = 'https://search.onboard-apis.com';
    private httpClient: any;
    private readonly token: string;

    constructor(
        @inject(TYPES.Cache) private cache: Cache,
    ) {
        this.token = Settings.get('attom')['access_token'];
        const proxyUrl = 'http://' + Settings.get('proxy');
        this.httpClient = request.defaults({ proxy: proxyUrl });
    }

    async findPropertyExpandedProfile(property: Property): Promise<any> {
        const cacheKey = `attom-property-expanded-profile-${property.getId()}`;
        if (await this.cache.has(cacheKey)) {
            return (await this.cache.get(cacheKey)).response;
        }

        const filters = {
            address1: property.getStreet(),
            address2: `${property.getCity()}, ${property.getState()}`,
            // postalCode: property.getZip(),
            // minBeds: property.getBedrooms(),
            // maxBeds: property.getBedrooms(),
            // minBathsTotal: property.getBathrooms(),
            // maxBathsTotal: property.getBathrooms(),
        };

        const requestURL = new url.URL('/propertyapi/v1.0.0/property/expandedprofile', this.baseUrl);

        const response = await this.httpClient.get({
            uri: requestURL.toString(),
            json: true,
            headers: {
                apikey: this.token,
            },
            qs: filters,
        });

        await this.cache.put(cacheKey, {
            payload: filters,
            response,
        });

        return response;
    }
}
