import DI from '../../../DI';

export default async function IterateProperties() {
    const propertyRepository = DI.propertyRepository();
    const opportunityZoneRepository = DI.opportunityZoneRepository();
    const properties = await propertyRepository.findAll();
    let total = properties.length;
    for (const property of properties) {
        try {
            console.log(`Processing ${property.getZillowId()} -  #${total}`);
            const opportunityZone = await opportunityZoneRepository.findOneByPoint(property.getLocation());
            if (opportunityZone) {
                console.log(`Saving opportunity zone id ${opportunityZone.getId()} to property ${property.getZillowId()}`);
                property.setOpportunityZoneId(opportunityZone.getId());
                await propertyRepository.save(property);
            }
        } catch (err) {
            console.log(err);
            console.log(`Error on property ${property.getId()}`);
        }
        total--;
    }
}
