import AttomClient from './AttomClient';
import Property from '../../Domain/Model/Property/Property';
import TaxRateInfo from '../../Domain/Model/Property/TaxRateInfo';
import TaxRateInfoRepository from '../../Domain/Model/Property/TaxRateInfoRepository';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../Types';

@injectable()
export default class AttomTaxRateInfoRepository implements TaxRateInfoRepository {
    constructor(
        @inject(TYPES.AttomClient) private client: AttomClient,
    ) {}

    async findByProperty(property: Property): Promise<TaxRateInfo[]> {
        try {
            const response: any = await this.client.findPropertyExpandedProfile(property);
            return [{
                origin: 'attom',
                rate: 100 * response.property[0].assessment.tax.taxAmt / property.getPrice(),
            }];

        } catch (err) {
            return [{
                origin: 'attom',
                rate: 0,
            }];
        }
    }
}
