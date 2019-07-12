import AddRemoteProperty from './AddRemoteProperty';
import RemotePropertyRepository from '../../../Domain/Model/Property/RemotePropertyRepository';
import sleep from '../../../Application/Helper/Sleep';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../Types';

interface Request {
    city: string;
}

@injectable()
export default class AddRemotePropertiesByCity {
    constructor(
        @inject(TYPES.RemotePropertyRepository) private remotePropertyRepository: RemotePropertyRepository,
        @inject(TYPES.AddRemoteProperty) private addRemoteProperty: AddRemoteProperty,
    ) {}

    async execute(request: Request): Promise<Array<string | number>> {
        const propertyIds = await this.remotePropertyRepository.findIdsByCity(request.city);
        for (const propertyId of propertyIds) {
            try {
                await this.addRemoteProperty.execute({ id: propertyId });
            } catch (err) {
                console.error(err.message);
            }
            await sleep(1000);
        }

        return propertyIds;
    }
}
