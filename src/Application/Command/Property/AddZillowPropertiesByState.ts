import DI from '../../../DI';

export default async function AddZillowPropertiesByState(state: string) {
    const regionsRepository = DI.regionRepository();
    const zips = await regionsRepository.getZipsByState(state);

    for (const zip of zips) {
        await DI.addRemotePropertiesByZip().execute({ zip });
    }
}
