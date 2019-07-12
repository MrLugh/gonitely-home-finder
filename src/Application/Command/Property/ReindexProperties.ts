import DI from '../../../DI';

export default async function ReindexProperties() {
    const propertyRepository = DI.propertyRepository();
    const propertyReadRepository = DI.propertyReadRepository();

    const properties = await propertyRepository.findAll();

    await propertyReadRepository.saveMany(
        properties.filter(property => property.isReady())
    );
}
