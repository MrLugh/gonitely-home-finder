import capitalize from '../../../Application/Helper/Capitalize';
import NotFoundError from '../../../Domain/Exception/NotFoundError';
import Property from '../../../Domain/Model/Property/Property';
import PropertyRepository from '../../../Domain/Model/Property/PropertyRepository';
import RemotePropertyRepository from '../../../Domain/Model/Property/RemotePropertyRepository';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../Types';
import { v4 as uuid } from 'uuid';
import PropertyReadRepository from '../../../Domain/Model/Property/PropertyReadRepository';
import OpportunityZoneRepository from '../../../Domain/Model/OpportunityZone/OpportunityZoneRepository';

interface Request {
    id: string;
}

@injectable()
export default class AddRemoteProperty {
    constructor(
        @inject(TYPES.PropertyRepository) private propertyRepository: PropertyRepository,
        @inject(TYPES.RemotePropertyRepository) private remotePropertyRepository: RemotePropertyRepository,
        @inject(TYPES.PropertyReadRepository) private readRepository: PropertyReadRepository,
        @inject(TYPES.OpportunityZoneRepository) private opportunityZoneRepository: OpportunityZoneRepository,
    ) {}

    async execute(request: Request): Promise<Property> {
        const remoteId = request.id;
        const remoteProperty = await this.remotePropertyRepository.findById(remoteId);
        if ( ! remoteProperty) {
            throw new NotFoundError('Remote property not found');
        }

        const existingProperty = await this.propertyRepository.findByRemoteId(remoteId);
        if (existingProperty instanceof Property) {
            existingProperty.updateFromRemote(remoteProperty);
            if ( ! existingProperty.isComplete()) {
                await this.propertyRepository.delete(existingProperty);
                await this.readRepository.delete(existingProperty);
                throw new NotFoundError('Remote property is not completed and was deleted');
            }

            if ( ! existingProperty.getOpportunityZoneId()) {
                const opportunityZone = await this.opportunityZoneRepository.findOneByPoint(existingProperty.getLocation());
                if (opportunityZone) {
                    existingProperty.setOpportunityZoneId(opportunityZone.getId());
                }
            }
            console.log(`Update property ${remoteId} - ${existingProperty.fullAddress()}`);
            return await this.propertyRepository.save(existingProperty);
        }

        const property = new Property(
            uuid(),
            remoteProperty.remoteId,
            remoteProperty.country,
            remoteProperty.state,
            capitalize(remoteProperty.county),
            capitalize(remoteProperty.city),
            remoteProperty.zip,
            remoteProperty.street,
            remoteProperty.price,
            remoteProperty.zEstimate,
            remoteProperty.bedrooms,
            remoteProperty.bathrooms,
            remoteProperty.sqft,
            remoteProperty.year,
            {latitude: remoteProperty.latitude, longitude: remoteProperty.longitude},
            remoteProperty.picture,
            remoteProperty.homeStatus,
            remoteProperty.homeType
        );
        property.setPictures(remoteProperty.pictures);
        property.setMortgageData(remoteProperty.mortgageData);
        property.setTaxRateInformation([{
            origin: remoteProperty.provider,
            rate: remoteProperty.taxRate,
        }]);
        const opportunityZone = await this.opportunityZoneRepository.findOneByPoint(property.getLocation());
        if (opportunityZone) {
            property.setOpportunityZoneId(opportunityZone.getId());
        }

        if ( ! property.isComplete()) {
            throw new NotFoundError('Remote property is not completed');
        }

        console.log(`Create property ${remoteId} - ${property.fullAddress()}`);
        return await this.propertyRepository.save(property);
    }
}
