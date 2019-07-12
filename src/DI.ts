import AddRemotePropertiesByCity from './Application/Service/Property/AddRemotePropertiesByCity';
import AddRemotePropertiesByZip from './Application/Service/Property/AddRemotePropertiesByZip';
import AddRemoteProperty from './Application/Service/Property/AddRemoteProperty';
import AddRentalInfoToProperty from './Application/Service/Property/AddRentalInfoToProperty';
import AirDNAClient from './Infrastructure/Service/AirDNAClient';
import AirDNARentalInfoRepository from './Infrastructure/Service/AirDNARentalInfoRepository';
import AttomClient from './Infrastructure/Service/AttomClient';
import AttomTaxRateInfoRepository from './Infrastructure/Service/AttomTaxRateInfoRepository';
import Cache from './Domain/Service/Cache';
import DomainEventPublisher from './Domain/Event/DomainEventPublisher';
import ElasticsearchLocationRepository from './Infrastructure/Domain/Model/Location/ElasticsearchLocationRepository';
import ElasticsearchPropertyRepository from './Infrastructure/Domain/Model/Property/ElasticsearchPropertyRepository';
import EliotAndMeApiClient from './Infrastructure/Service/EliotAndMeApiClient';
import EliotAndMeRentalInfoApiRepository from './Infrastructure/Service/EliotAndMeRentalInfoApiRepository';
import EliotAndMeRentalInfoAutomationRepository from './Infrastructure/Service/EliotAndMeRentalInfoAutomationRepository';
import EliotAndMeRentalInfoRepository from './Infrastructure/Service/EliotAndMeRentalInfoRepository';
import EventPublisher from './Domain/Service/EventPublisher';
import GetLocations from './Application/Service/Location/GetLocations';
import GetProperties from './Application/Service/Property/GetProperties';
import GetProperty from './Application/Service/Property/GetProperty';
import GetOpportunityZones from './Application/Service/OpportunityZone/GetOpportunityZones';
import InMemoryLocationRepository from './Infrastructure/Domain/Model/Location/InMemoryLocationRepository';
import InMemoryPropertyRepository from './Infrastructure/Domain/Model/Property/InMemoryPropertyRepository';
import InMemoryRegionRepository from './Infrastructure/Domain/Model/Region/InMemoryRegionRepository';
import LocationRepository from './Domain/Model/Location/LocationRepository';
import MongooseCache from './Infrastructure/Service/Cache/MongooseCache';
import MongooseOpportunityZoneRepository from './Infrastructure/Domain/Model/OpportunityZone/MongooseOpportunityZone';
import MongoosePropertyRepository from './Infrastructure/Domain/Model/Property/MongoosePropertyRepository';
import MongooseRegionRepository from './Infrastructure/Domain/Model/Region/MongooseRegionRepository';
import MultipleRentalInfoRepository from './Infrastructure/Service/MultipleRentalInfoRepository';
import PropertyReadRepository from './Domain/Model/Property/PropertyReadRepository';
import PropertyRepository from './Domain/Model/Property/PropertyRepository';
import RabbitMQService from './Infrastructure/Service/RabbitMQService';
import RegionRepository from './Domain/Model/Region/RegionRepository';
import RemotePropertyRepository from './Domain/Model/Property/RemotePropertyRepository';
import RentalInfoRepository from './Domain/Model/Property/RentalInfoRepository';
import RequestRemoteProperty from './Infrastructure/Domain/Event/RequestRemoteProperty';
import TaxRateInfoRepository from './Domain/Model/Property/TaxRateInfoRepository';
import ZillowRemotePropertyRepository from './Infrastructure/Service/ZillowRemotePropertyRepository';
import { Container as IoC } from 'inversify';
import { TYPES } from './Types';
import OpportunityZoneRepository from './Domain/Model/OpportunityZone/OpportunityZoneRepository';

class DI {
    private _container: IoC;

    constructor() {
        this._container = new IoC();

        // Use cases
        this._container.bind<GetProperties>(TYPES.GetProperties).to(GetProperties).inSingletonScope();
        this._container.bind<GetProperty>(TYPES.GetProperty).to(GetProperty).inSingletonScope();
        this._container.bind<GetLocations>(TYPES.GetLocations).to(GetLocations).inSingletonScope();
        this._container.bind<GetOpportunityZones>(TYPES.GetOpportunityZones).to(GetOpportunityZones).inSingletonScope();
        this._container.bind<AddRemoteProperty>(TYPES.AddRemoteProperty).to(AddRemoteProperty).inSingletonScope();
        this._container.bind<AddRemotePropertiesByZip>(TYPES.AddRemotePropertiesByZip).to(AddRemotePropertiesByZip).inSingletonScope();
        this._container.bind<AddRemotePropertiesByCity>(TYPES.AddRemotePropertiesByCity).to(AddRemotePropertiesByCity).inSingletonScope();
        this._container.bind<AddRentalInfoToProperty>(TYPES.AddRentalInfoToProperty).to(AddRentalInfoToProperty).inSingletonScope();

        // Services
        this._container.bind<RabbitMQService>(TYPES.RabbitMQService).to(RabbitMQService).inSingletonScope();
        this._container.bind<EventPublisher>(TYPES.EventPublisher).to(RabbitMQService).inSingletonScope();

        this._container.bind<MongooseCache>(TYPES.MongooseCache).to(MongooseCache).inSingletonScope();
        this._container.bind<Cache>(TYPES.Cache).to(MongooseCache).inSingletonScope();

        this._container.bind<EliotAndMeApiClient>(TYPES.EliotAndMeApiClient).to(EliotAndMeApiClient).inSingletonScope();
        this._container.bind<AirDNAClient>(TYPES.AirDNAClient).to(AirDNAClient).inSingletonScope();
        this._container.bind<AttomClient>(TYPES.AttomClient).to(AttomClient).inSingletonScope();

        // Repositories
        this._container.bind<InMemoryPropertyRepository>(TYPES.InMemoryPropertyRepository).to(InMemoryPropertyRepository).inSingletonScope();
        this._container.bind<MongoosePropertyRepository>(TYPES.MongoosePropertyRepository).to(MongoosePropertyRepository).inSingletonScope();
        this._container.bind<PropertyRepository>(TYPES.PropertyRepository).to(MongoosePropertyRepository).inSingletonScope();
        this._container.bind<ElasticsearchPropertyRepository>(TYPES.ElasticsearchPropertyRepository).to(ElasticsearchPropertyRepository).inSingletonScope();
        this._container.bind<PropertyReadRepository>(TYPES.PropertyReadRepository).to(ElasticsearchPropertyRepository).inSingletonScope();
        this._container.bind<OpportunityZoneRepository>(TYPES.OpportunityZoneRepository).to(MongooseOpportunityZoneRepository).inSingletonScope();


        this._container.bind<ZillowRemotePropertyRepository>(TYPES.ZillowRemotePropertyRepository).to(ZillowRemotePropertyRepository).inSingletonScope();
        this._container.bind<RemotePropertyRepository>(TYPES.RemotePropertyRepository).to(ZillowRemotePropertyRepository).inSingletonScope();

        this._container.bind<EliotAndMeRentalInfoApiRepository>(TYPES.EliotAndMeRentalInfoApiRepository).to(EliotAndMeRentalInfoApiRepository).inSingletonScope();
        this._container.bind<EliotAndMeRentalInfoAutomationRepository>(TYPES.EliotAndMeRentalInfoAutomationRepository).to(EliotAndMeRentalInfoAutomationRepository).inSingletonScope();
        this._container.bind<EliotAndMeRentalInfoRepository>(TYPES.EliotAndMeRentalInfoRepository).to(EliotAndMeRentalInfoAutomationRepository).inSingletonScope();
        this._container.bind<AirDNARentalInfoRepository>(TYPES.AirDNARentalInfoRepository).to(AirDNARentalInfoRepository).inSingletonScope();
        this._container.bind<MultipleRentalInfoRepository>(TYPES.MultipleRentalInfoRepository).to(MultipleRentalInfoRepository).inSingletonScope();
        this._container.bind<RentalInfoRepository>(TYPES.RentalInfoRepository).to(MultipleRentalInfoRepository).inSingletonScope();

        this._container.bind<AttomTaxRateInfoRepository>(TYPES.AttomTaxRateInfoRepository).to(AttomTaxRateInfoRepository).inSingletonScope();
        this._container.bind<TaxRateInfoRepository>(TYPES.TaxRateInfoRepository).to(AttomTaxRateInfoRepository).inSingletonScope();

        this._container.bind<InMemoryRegionRepository>(TYPES.InMemoryRegionRepository).to(InMemoryRegionRepository).inSingletonScope();
        this._container.bind<RegionRepository>(TYPES.RegionRepository).to(MongooseRegionRepository).inSingletonScope();

        this._container.bind<InMemoryLocationRepository>(TYPES.InMemoryLocationRepository).to(InMemoryLocationRepository).inSingletonScope();
        this._container.bind<ElasticsearchLocationRepository>(TYPES.ElasticsearchLocationRepository).to(ElasticsearchLocationRepository).inSingletonScope();
        this._container.bind<LocationRepository>(TYPES.LocationRepository).to(ElasticsearchLocationRepository).inSingletonScope();
    }

    getProperties(): GetProperties {
        return this._container.get<GetProperties>(TYPES.GetProperties);
    }

    getProperty(): GetProperty {
        return this._container.get<GetProperty>(TYPES.GetProperty);
    }

    addRemoteProperty(): AddRemoteProperty {
        return this._container.get<AddRemoteProperty>(TYPES.AddRemoteProperty);
    }

    addRemotePropertiesByZip(): AddRemotePropertiesByZip {
        DomainEventPublisher.subscribe(
            new RequestRemoteProperty(
                this._container.get<EventPublisher>(TYPES.EventPublisher),
            ),
        );

        return this._container.get<AddRemotePropertiesByZip>(TYPES.AddRemotePropertiesByZip);
    }

    addRemotePropertiesByCity(): AddRemotePropertiesByCity {
        DomainEventPublisher.subscribe(
            new RequestRemoteProperty(
                this._container.get<EventPublisher>(TYPES.EventPublisher),
            ),
        );

        return this._container.get<AddRemotePropertiesByCity>(TYPES.AddRemotePropertiesByCity);
    }

    addRentalInfoToProperty(): AddRentalInfoToProperty {
        return this._container.get<AddRentalInfoToProperty>(TYPES.AddRentalInfoToProperty);
    }

    getLocations(): GetLocations {
        return this._container.get<GetLocations>(TYPES.GetLocations);
    }

    getOpportunityZones(): GetOpportunityZones {
        return this._container.get<GetOpportunityZones>(TYPES.GetOpportunityZones);
    }

    propertyRepository(): PropertyRepository {
        return this._container.get<PropertyRepository>(TYPES.PropertyRepository);
    }

    propertyReadRepository(): PropertyReadRepository {
        return this._container.get<PropertyReadRepository>(TYPES.PropertyReadRepository);
    }

    opportunityZoneRepository(): OpportunityZoneRepository {
        return this._container.get<OpportunityZoneRepository>(TYPES.OpportunityZoneRepository);
    }

    locationRepository(): LocationRepository {
        return this._container.get<LocationRepository>(TYPES.LocationRepository);
    }

    regionRepository(): RegionRepository {
        return this._container.get<RegionRepository>(TYPES.RegionRepository);
    }

    cache(): Cache {
        return this._container.get<Cache>(TYPES.Cache);
    }

    eliotAndMeRentalInfoRepository(): EliotAndMeRentalInfoRepository {
        return this._container.get<EliotAndMeRentalInfoRepository>(TYPES.EliotAndMeRentalInfoRepository);
    }

    airDNARentalInfoRepository(): AirDNARentalInfoRepository {
        return this._container.get<AirDNARentalInfoRepository>(TYPES.AirDNARentalInfoRepository);
    }

    attomTaxRateRepository(): AttomTaxRateInfoRepository {
        return this._container.get<AttomTaxRateInfoRepository>(TYPES.AttomTaxRateInfoRepository);
    }
}

export default new DI();
