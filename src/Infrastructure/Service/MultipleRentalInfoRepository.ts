import AirDNARentalInfoRepository from './AirDNARentalInfoRepository';
import Property from '../../Domain/Model/Property/Property';
import RentalInfo from '../../Domain/Model/Property/RentalInfo';
import RentalInfoRepository from '../../Domain/Model/Property/RentalInfoRepository';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../Types';
import EliotAndMeRentalInfoRepository from './EliotAndMeRentalInfoRepository';

@injectable()
export default class MultipleRentalInfoRepository implements RentalInfoRepository {
    constructor(
        @inject(TYPES.AirDNARentalInfoRepository) private airDNARentalInfoRepository: AirDNARentalInfoRepository,
        @inject(TYPES.EliotAndMeRentalInfoRepository) private eliotAndMeRentalInfoRepository: EliotAndMeRentalInfoRepository,
    ) {}

    async findByProperty(property: Property): Promise<RentalInfo[]> {
        if ( ! property.isComplete()) {
            console.log(`property is not complete ${property.getId()}`);
            return [];
        }

        const info: RentalInfo[] = [];

        if ( ! property.containsRentalInfoFor('airdna', 'street')) {
            const rentalInformation = await this.airDNARentalInfoRepository.findByProperty(property);
            for (const rentalInfo of rentalInformation) {
                info.push(rentalInfo);
            }
        }

        if ( ! property.containsRentalInfoFor('eliotandme', 'street')) {
            const rentalInformation = await this.eliotAndMeRentalInfoRepository.findByProperty(property);
            for (const rentalInfo of rentalInformation) {
                info.push(rentalInfo);
            }
        }

        return info;
    }
}
