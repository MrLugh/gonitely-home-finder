import DI from '../../../DI';
import Region from '../../../Domain/Model/Region/Region';
import ZillowClient from '../../../Infrastructure/Service/ZillowClient';
import { v4 as uuid } from 'uuid';

export default async function GetZillowRegionsByState(state: string) {
    const repository = DI.regionRepository();

    console.log(`Processing state: ${state}`);
    let stateResponse;
    try {
        stateResponse = await ZillowClient.getRegionChildren(undefined, state);
    } catch (err) {
        console.log(`Error processing state: ${state}`, err);
        return;
    }

    const zillowStateId = stateResponse.response.region.id;

    const existingState = await repository.findByRemoteId(zillowStateId);
    if ( ! existingState) {
        console.log(`Saving state: ${state}`);
        await repository.save(
            new Region(uuid(), zillowStateId, 'US', state),
        );
    }

    if ( ! parseInt(stateResponse.response.list.count)) {
        return;
    }

    const stateList = stateResponse.response.list.region;
    const stateRegions = Array.isArray(stateList) ? stateList : [stateList];
    for (const countyObject of stateRegions) {
        const county = countyObject.name;

        console.log(`Processing county: ${county}`);
        let countyResponse;
        try {
            countyResponse = await ZillowClient.getRegionChildren(undefined, state, county);
        } catch (err) {
            console.log(`Error processing county: ${county}`, err);
            continue;
        }
        const zillowCountyId = countyObject.id;

        const existingCounty = await repository.findByRemoteId(zillowCountyId);
        if ( ! existingCounty) {
            console.log(`Saving county: ${county}`);
            await repository.save(
                new Region(uuid(), zillowCountyId, 'US', state, county),
            );
        }

        if ( ! parseInt(countyResponse.response.list.count)) {
            console.log(`No cities in ${county}`);
            continue;
        }

        const regionList = countyResponse.response.list.region;
        const cityRegions = Array.isArray(regionList) ? regionList : [regionList];

        for (const cityObject of cityRegions) {
            const city = cityObject.name;

            console.log(`Processing city: ${city}`);
            let cityResponse;
            try {
                cityResponse =  await ZillowClient.getRegionChildren(undefined, state, county, city);
            } catch (err) {
                console.log(`Error processing city: ${city}`, err);
                continue;
            }
            const zillowCityId = cityObject.id;

            const existingCity = await repository.findByRemoteId(zillowCityId);
            if ( ! existingCity) {
                console.log(`Saving city: ${city}`);
                await repository.save(
                    new Region(uuid(), zillowCityId, 'US', state, county, city),
                );
            }

            if ( ! parseInt(cityResponse.response.list.count)) {
                console.log(`No zip codes in ${city}`);
                continue;
            }

            const cityList = cityResponse.response.list.region;
            const zipRegions = Array.isArray(cityList) ? cityList : [cityList];

            for (const zipObject of zipRegions) {
                const zip = zipObject.name;
                const zillowZipId = zipObject.id;

                console.log(`Processing zip: ${zip}`);
                const existingZip = await repository.findByRemoteId(zillowZipId);
                if ( ! existingZip) {
                    console.log(`Saving zip code : ${zip}`);
                    await repository.save(
                        new Region(uuid(), zillowZipId, 'US', state, county, city, zip)
                    );
                }
            }
        }
    }
}
