import 'reflect-metadata';
import 'mocha';
import GetLocations from '../../../../../src/Application/Service/Location/GetLocations';
import GetLocationsRequest from '../../../../../src/Application/Service/Location/GetLocationsRequest';
import InMemoryLocationRepository from '../../../../../src/Infrastructure/Domain/Model/Location/InMemoryLocationRepository';
import JsonApiQuery from '../../../../../src/Infrastructure/Service/JsonApiQuery';
import Location from '../../../../../src/Domain/Model/Location/Location';
import { assert } from 'chai';

describe('Get regions', () => {
    const regionRepository = new InMemoryLocationRepository();
    const service = new GetLocations(regionRepository);

    beforeEach(() => {
        regionRepository.clear();
    });

    it('gets a list of regions', async () => {
        const region = new Location(
            'US',
            'CA',
            'San Francisco',
            '94015',
        );
        regionRepository.save(region);

        const regions = await service.execute(new GetLocationsRequest(new JsonApiQuery()));

        assert.equal(regions.getTotal(), 1);
        assert.deepEqual(regions.getCollection()[0], region);
    });

    it('gets no regions when collection is empty', async () => {
        const regions = await service.execute(new GetLocationsRequest(new JsonApiQuery()));

        assert.equal(regions.getTotal(), 0);
        assert.isEmpty(regions.getCollection());
    });
});
