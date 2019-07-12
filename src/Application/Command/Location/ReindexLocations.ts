import DI from '../../../DI';
import ElasticsearchLocationRepository from '../../../Infrastructure/Domain/Model/Location/ElasticsearchLocationRepository';

export default async function ReindexLocations() {
    const propertyRepository = DI.propertyRepository();
    const locationRepository = new ElasticsearchLocationRepository();

    const properties = await propertyRepository.findAll();
    for (const property of properties) {
        if ( ! property.isReady()) {
            continue;
        }

        await locationRepository.saveFromProperty(property);
    }
}
