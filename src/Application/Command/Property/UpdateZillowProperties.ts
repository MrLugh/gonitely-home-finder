import DI from '../../../DI';

export default async function UpdateZillowProperties() {
    const propertyRepository = DI.propertyRepository();
    const properties = await propertyRepository.findAll();
    for (const property of properties) {
        console.log(`Processing ${property.getZillowId()} - ${property.fullAddress()}`);
        try {
            await DI.addRemoteProperty().execute({ id: property.getZillowId() });
        } catch (err) {
            console.log(err.message);
        }
    }
}
