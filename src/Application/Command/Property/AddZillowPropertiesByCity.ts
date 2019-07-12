import DI from '../../../DI';

export default async function AddZillowPropertiesByCity(city: string, state: string) {
    // await DI.addRemotePropertiesByCity().execute(
    //     new AddRemotePropertiesByCityRequest({ city })
    // );

    const regionsRepository = DI.regionRepository();
    const zips = await regionsRepository.getZipsByCity(city, state);

    for (const zip of zips) {
        console.log(`Zip ${zip}`);
        await DI.addRemotePropertiesByZip().execute({ zip });
    }
}
