import DI from '../../../DI';

export default async function ProcessEliotAndMeRentalInfo() {
    const propertyRepository = DI.propertyRepository();
    const properties = await propertyRepository.findAll();
    const repository = DI.eliotAndMeRentalInfoRepository();

    for (const property of properties) {
        if (property.containsRentalInfoFor('eliotandme', 'street') || ! property.isComplete()) {
            continue;
        }

        try {
            console.log(`Processing ${property.getZillowId()}`);
            const rentalInformation = await repository.findByProperty(property);
            for (const rentalInfo of rentalInformation) {
                property.addRentalInformation(rentalInfo);
            }

            await propertyRepository.save(property);
        } catch (err) {
            console.error(`Error: property ${property.getId()}: ${err.message}`);
        }
    }
}
