import Property from '../../../Domain/Model/Property/Property';
import PropertyReadRepository from '../../../Domain/Model/Property/PropertyReadRepository';
import PropertyRepository from '../../../Domain/Model/Property/PropertyRepository';
import RentalInfoRepository from '../../../Domain/Model/Property/RentalInfoRepository';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../Types';
import LocationRepository from '../../../Domain/Model/Location/LocationRepository';

interface Request {
    id: string;
}

@injectable()
export default class AddRentalInfoToProperty {
    constructor(
        @inject(TYPES.PropertyRepository) private propertyRepository: PropertyRepository,
        @inject(TYPES.RentalInfoRepository) private rentalInfoRepository: RentalInfoRepository,
        @inject(TYPES.PropertyReadRepository) private propertyReadRepository: PropertyReadRepository,
        @inject(TYPES.LocationRepository) private locationRepository: LocationRepository,
    ) {}

    async execute(request: Request): Promise<Property> {
        const property = await this.propertyRepository.findByIdOrFail(request.id);
        if ( ! property.isComplete()) {
            console.log('property is not complete');
            return property;
        }

        const rentalInformation = await this.rentalInfoRepository.findByProperty(property);
        for (const rentalInfo of rentalInformation) {
            property.addRentalInformation(rentalInfo);
        }

        await this.propertyRepository.save(property);
        if (property.isReady()) {
            await this.propertyReadRepository.save(property);
            await this.locationRepository.saveFromProperty(property);
        }

        return property;
    }
}