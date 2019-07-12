import DI from '../../../DI';

export default async function AddZillowPropertiesForOpportunityZones() {
    const OpportunityZoneRepository = DI.opportunityZoneRepository();
    const zips = await OpportunityZoneRepository.getZips();

   /*
   const repository = DI.propertyRepository();
   const zips = await repository.findZipsInOpportunityZones();
   */

    for (const zip of zips) {
        try {
            await DI.addRemotePropertiesByZip().execute({ zip });
        } catch (err) {
            console.log(`Error fetching properties for zip ${zip} - ${err.message}`);
        }
    }
}
