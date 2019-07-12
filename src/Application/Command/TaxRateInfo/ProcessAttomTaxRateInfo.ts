import DI from '../../../DI';

export default async function ProcessAttomTaxRateInfo() {
    const propertyRepository = DI.propertyRepository();
    const properties = await propertyRepository.findAll();
    const repository = DI.attomTaxRateRepository();

    for (const property of properties) {
        if (property.containsTaxRateInfoFor('attom') || ! property.isComplete()) {
            console.log(`Skip property ${property.getId()}`);
            continue;
        }

        try {
            const taxRateInformation = await repository.findByProperty(property);
            console.log(property.getId(), taxRateInformation);
            for (const taxRateInfo of taxRateInformation) {
                property.addTaxRateInformation(taxRateInfo);
            }

            await propertyRepository.save(property);
        } catch (err) {
            console.error(`Error: property ${property.getId()}`, err);
        }
    }
}
