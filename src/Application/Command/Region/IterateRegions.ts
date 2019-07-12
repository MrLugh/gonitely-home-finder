import DI from '../../../DI';
import { v4 as uuid } from 'uuid';

export default async function IterateRegions() {
    const regionRepository = DI.regionRepository();
    const regions = await regionRepository.findAll();
    let total = 0;
    for (const region of regions) {
        try {
            console.log(`Processing ${region.getZillowId()} -  #${total}`);
            await regionRepository.save(region);
        } catch (err) {
            console.log(err);
            console.log(`Error on region ${region.getId()}`);
        }
        total++;
    }
}
