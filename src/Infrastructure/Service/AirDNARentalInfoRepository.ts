import AirDNAClient from './AirDNAClient';
import Property from '../../Domain/Model/Property/Property';
import RentalInfo from '../../Domain/Model/Property/RentalInfo';
import RentalInfoRepository from '../../Domain/Model/Property/RentalInfoRepository';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../Types';

@injectable()
export default class AirDNARentalInfoRepository implements RentalInfoRepository {
    constructor(
        @inject(TYPES.AirDNAClient) private client: AirDNAClient,
    ) {}

    async findByProperty(property: Property): Promise<RentalInfo[]> {
        try {
            const response: any = await this.client.findByProperty(property);
            if (!response) {
                return [];
            }

            const occupancyRate = response.property_stats.occupancy.ltm;
            const averageDailyRate = response.property_stats.adr.ltm;
            const dailyRevenue = occupancyRate * averageDailyRate;

            return [{
                origin: 'airdna',
                accuracy: 'street',
                occupancyRate: occupancyRate,
                averageDailyRate: averageDailyRate,
                revenue: dailyRevenue,
            }];

        } catch (err) {
            console.error('AirDNARentalInfoRepository error', err);
            return [{
                origin: 'airdna',
                accuracy: 'street',
                occupancyRate: 0,
                averageDailyRate: 0,
                revenue: 0,
            }];
        }
    }
}
