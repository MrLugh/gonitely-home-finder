import EliotAndMeApiClient from './EliotAndMeApiClient';
import EliotAndMeRentalInfoRepository from './EliotAndMeRentalInfoRepository';
import Property from '../../Domain/Model/Property/Property';
import RentalInfo from '../../Domain/Model/Property/RentalInfo';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../Types';

@injectable()
export default class EliotAndMeRentalInfoApiRepository implements EliotAndMeRentalInfoRepository {
    constructor(
        @inject(TYPES.EliotAndMeApiClient) private client: EliotAndMeApiClient,
    ) {}

    async findByProperty(property: Property): Promise<RentalInfo[]> {
        try {
            const response: any = await this.client.findByProperty(property);
            if (!response) {
                return [];
            }

            return [{
                origin: 'eliotandme',
                accuracy: 'street',
                occupancyRate : 0,
                averageDailyRate: response.daily_estimate,
                revenue: parseFloat(response.daily_estimate) * 30,
            }];

        } catch (err) {
            console.error('EliotAndMeRentalInfoApiRepository error', err);
            return [];
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
