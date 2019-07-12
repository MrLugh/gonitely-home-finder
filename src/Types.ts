const TYPES = {
    // Use cases
    GetProperties: Symbol.for('GetProperties'),
    GetProperty: Symbol.for('GetProperty'),
    AddRemoteProperty: Symbol.for('AddRemoteProperty'),
    AddRemotePropertiesByZip: Symbol.for('AddRemotePropertiesByZip'),
    AddRemotePropertiesByCity: Symbol.for('AddRemotePropertiesByCity'),
    AddRentalInfoToProperty: Symbol.for('AddRentalInfoToProperty'),
    GetLocations: Symbol.for('GetLocations'),
    GetOpportunityZones: Symbol.for('GetOpportunityZones'),

    // Repositories
    PropertyRepository: Symbol.for('PropertyRepository'),
    PropertyReadRepository: Symbol.for('PropertyReadRepository'),
    InMemoryPropertyRepository: Symbol.for('InMemoryPropertyRepository'),
    ElasticsearchPropertyRepository: Symbol.for('ElasticsearchPropertyRepository'),
    MongoosePropertyRepository: Symbol.for('MongoosePropertyRepository'),
    OpportunityZoneRepository: Symbol.for('OpportunityZoneRepository'),
    MongooseOpportunityZoneRepository: Symbol.for('MongooseOpportunityZoneRepository'),

    RemotePropertyRepository: Symbol.for('RemotePropertyRepository'),
    ZillowRemotePropertyRepository: Symbol.for('ZillowRemotePropertyRepository'),

    AirDNARentalInfoRepository: Symbol.for('AirDNARentalInfoRepository'),
    EliotAndMeRentalInfoApiRepository: Symbol.for('EliotAndMeRentalInfoApiRepository'),
    EliotAndMeRentalInfoAutomationRepository: Symbol.for('EliotAndMeRentalInfoAutomationRepository'),
    EliotAndMeRentalInfoRepository: Symbol.for('EliotAndMeRentalInfoRepository'),
    MultipleRentalInfoRepository: Symbol.for('MultipleRentalInfoRepository'),
    RentalInfoRepository: Symbol.for('RentalInfoRepository'),

    AttomTaxRateInfoRepository: Symbol.for('AttomTaxRateInfoRepository'),
    TaxRateInfoRepository: Symbol.for('TaxRateInfoRepository'),

    RegionRepository: Symbol.for('RegionRepository'),
    InMemoryRegionRepository: Symbol.for('InMemoryRegionRepository'),
    ElasticsearchRegionRepository: Symbol.for('ElasticsearchRegionRepository'),

    LocationRepository: Symbol.for('LocationRepository'),
    InMemoryLocationRepository: Symbol.for('InMemoryLocationRepository'),
    ElasticsearchLocationRepository: Symbol.for('ElasticsearchLocationRepository'),

    // Services
    ZillowClient: Symbol.for('ZillowClient'),

    EventPublisher: Symbol.for('EventPublisher'),
    RabbitMQService: Symbol.for('RabbitMQService'),

    EliotAndMeApiClient: Symbol.for('EliotAndMeApiClient'),
    AirDNAClient: Symbol.for('AirDNAClient'),
    AttomClient: Symbol.for('AttomClient'),

    Cache: Symbol.for('Cache'),
    MongooseCache: Symbol.for('MongooseCache'),
};

export { TYPES };
