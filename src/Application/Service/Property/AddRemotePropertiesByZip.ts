import AddRemoteProperty from './AddRemoteProperty';
import DomainEventPublisher from '../../../Domain/Event/DomainEventPublisher';
import PropertyWasRequested from '../../../Domain/Model/Property/Event/PropertyWasRequested';
import RemotePropertyRepository from '../../../Domain/Model/Property/RemotePropertyRepository';
import sleep from '../../../Application/Helper/Sleep';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../Types';

interface Request {
    zip: string;
}
@injectable()
export default class AddRemotePropertiesByZip {
    constructor(
        @inject(TYPES.RemotePropertyRepository) private remotePropertyRepository: RemotePropertyRepository,
        @inject(TYPES.AddRemoteProperty) private addRemoteProperty: AddRemoteProperty,
    ) {}

    async execute(request: Request): Promise<Array<string | number>> {
        let propertyIds: string[] = [];
        try {
            propertyIds = await this.remotePropertyRepository.findIdsByZip(request.zip);
        } catch (err) {
            console.error(err.message);
            return propertyIds;
        }

        for (const propertyId of propertyIds) {
            // await DomainEventPublisher.publish(
            //     new PropertyWasRequested(propertyId.toString())
            // );
            try {
                await this.addRemoteProperty.execute({ id: propertyId });
                await sleep(1000);
            } catch (err) {
                console.error(err.message);
            }
        }

        return propertyIds;
    }
}
