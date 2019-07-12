import * as request from 'request-promise';
import * as url from 'url';
import Cache from '../../Domain/Service/Cache';
import Property from '../../Domain/Model/Property/Property';
import Settings from '../../Settings';
import sleep from '../../Application/Helper/Sleep';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../Types';

@injectable()
export default class EliotAndMeApiClient {
    private baseUrl = 'https://www.eliotandme.com';
    private httpClient: any;
    private readonly token: string;

    constructor(
        @inject(TYPES.Cache) private cache: Cache,
    ) {
        this.token = Settings.get('eliotandme')['access_token'];
        this.httpClient = request;
    }

    async findByProperty(property: Property): Promise<any> {
        const cacheKey = `eliotandme-property-${property.getId()}`;
        if (await this.cache.has(cacheKey)) {
            return (await this.cache.get(cacheKey)).response;
        }

        const requestURL = new url.URL('/estimator/api', this.baseUrl);
        const response = await this.httpClient.get({
            uri: requestURL.toString(),
            json: true,
            qs: {
                key: this.token,
                bedrooms: property.getBedrooms(),
                bathrooms: property.getBathrooms(),
                lat: property.getLatitude(),
                long: property.getLongitude(),
                room_type: 'entire-place',
                currency: 'usd',
            },
        });

        await this.cache.put(cacheKey, {
            payload: {
                zillowId: property.getZillowId(),
                bedrooms: property.getBedrooms(),
                bathrooms: property.getBathrooms(),
                lat: property.getLatitude(),
                long: property.getLongitude(),
                room_type: 'entire-place',
                currency: 'usd',
            },
            response,
        });
        await sleep(500);
        return response;
    }
}
