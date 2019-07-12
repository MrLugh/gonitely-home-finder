import DI from '../../../DI';

export default async function AddZillowPropertiesByZip(zip: string) {
    await DI.addRemotePropertiesByZip().execute({ zip });
}
