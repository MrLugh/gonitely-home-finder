import Automator from './Automator';
import Cache from '../../Domain/Service/Cache';
import EliotAndMeRentalInfoRepository from './EliotAndMeRentalInfoRepository';
import Property from '../../Domain/Model/Property/Property';
import RentalInfo from '../../Domain/Model/Property/RentalInfo';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../Types';

@injectable()
export default class EliotAndMeRentalInfoAutomationRepository implements EliotAndMeRentalInfoRepository {
    private browser: Promise<any>;
    private url = 'https://www.eliotandme.com/estimator/home_search?utf8=%E2%9C%93&query_info=&query_type=default';
    private timeout = 2500;

    constructor(
        @inject(TYPES.Cache) private cache: Cache,
    ) {
        this.browser = new Automator().getBrowser();
    }

    async findByProperty(property: Property): Promise<RentalInfo[]> {
        const cacheKey = `eliotandme-property-${property.getId()}`;
        if (await this.cache.has(cacheKey)) {
            return (await this.cache.get(cacheKey)).response;
        }

        let page: any;
        try {
            page = await (await this.browser).newPage();

            // Search
            const search = encodeURIComponent(`${property.getStreet()} ${property.getCity()} ${property.getState()}`);
            await page.goto(`${this.url}&address=${search}`);

            // Closing modal
            await page.waitForSelector('#detailsPageModal', { timeout: this.timeout });
            await page.click('#detailsPageModal button[data-dismiss="modal"]');

            // Opening edit panel
            await page.waitForSelector('#propertyInfoTitle', { timeout: this.timeout });
            await page.click('#propertyInfoTitle a.btn.btn-sm.btn-primary.text-white');

            await page.waitForSelector('#propertyDetailsForm', { timeout: this.timeout });
            await page.type('#sleeps_custom', (property.getBedrooms() * 2).toString());
            await page.type('#beds_custom', property.getBedrooms().toString());
            await page.type('#baths_custom', property.getBathrooms().toString());
            await page.click('#propertyDetailsForm button[type="submit"]');

            // Get results
            await page.waitForSelector('#estimateInfoSection', { timeout: this.timeout });

            const dailyEstimateHtml = await page.evaluate(
                (el: any) => el.innerHTML.trim(),
                await page.$('#estimateInfoSection div h1'),
            );

            const dailyEstimateValue = parseFloat(
                dailyEstimateHtml.replace(/,/g, '').match(/\d+/)[0],
            );


            if (!dailyEstimateValue) {
                throw new Error('No daily estimate');
            }

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
                response: {
                    daily_estimate: dailyEstimateValue
                },
            });

            await page.close();

            return [{
                origin: 'eliotandme',
                accuracy: 'street',
                occupancyRate: 0,
                averageDailyRate: dailyEstimateValue,
                revenue: dailyEstimateValue * 30,
            }];

        } catch (err) {
            await page.close();
            console.error(`Error: property ${property.getId()}: ${err.message}`);

            return [{
                origin: 'eliotandme',
                accuracy: 'street',
                occupancyRate: 0,
                averageDailyRate: 0,
                revenue: 0,
            }];
        }
    }
}
