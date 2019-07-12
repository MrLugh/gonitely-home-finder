import * as mongoose from 'mongoose';
import MongooseConnection from '../../../../Infrastructure/Persistence/MongooseConnection';
import NotFoundError from '../../../../Domain/Exception/NotFoundError';
import Region from '../../../../Domain/Model/Region/Region';
import RegionRepository from '../../../../Domain/Model/Region/RegionRepository';
import { injectable } from 'inversify';

@injectable()
export default class MongooseRegionRepository implements RegionRepository {
    private collection: mongoose.Collection;

    constructor() {
        this.collection = MongooseConnection.getConnection().collection('regions');
    }

    async findByIdOrFail(id: string): Promise<Region> {
        const data = await this.collection.findOne({ id: id });
        if (!data) {
            throw new NotFoundError('Region not found');
        }

        return this.hydrate(data);
    }

    async findByRemoteId(remoteId: string): Promise<Region | undefined> {
        const data = await this.collection.findOne({ zillowId: remoteId });
        if (!data) {
            return undefined;
        }

        return this.hydrate(data);
    }

    async findAll(): Promise<Region[]> {
        const collection = await this.collection.find().toArray();

        return collection.map(region => this.hydrate(region));
    }

    async findZipsByCity(city: string, state: string): Promise<Region[]> {
        const collection = await this.collection.find({ city: city, state: state, type: 'zip' }).toArray();

        return collection.map(region => this.hydrate(region));
    }

    async findZipsByState(state: string): Promise<Region[]> {
        const collection = await this.collection.find({ state: state, type: 'zip' }).toArray();

        return collection.map(region => this.hydrate(region));
    }

    async save(region: Region): Promise<Region> {
        await this.collection.updateOne(
            { id: region.getId() },
            {
                $set: {
                    zillowId: region.getZillowId(),
                    country: region.getCountry(),
                    state: region.getState(),
                    county: region.getCounty(),
                    city: region.getCity(),
                    zip: region.getZip(),
                    type: region.getType(),
                    url: region.getUrl(),
                    referer: region.getReferer(),
                },
            },
            { upsert: true },
        );

        return await region;
    }

    async total(): Promise<number> {
        return await this.collection.countDocuments();
    }

    async getStates(): Promise<string[]> {
        return await this.collection.distinct('state', {});
    }

    async getZipsByCity(city: string, state: string): Promise<string[]> {
        const regions = await this.collection
            .find({ city: city, state: state, type: 'zip' })
            .toArray();

        return regions.map(region => region.zip);
    }

    async getZipsByState(state: string): Promise<string[]> {
        const regions = await this.collection.find({ state: state, type: 'zip' }).toArray();

        return regions.map(region => region.zip);
    }

    async findByZip(zip: string): Promise<Region | undefined> {
        const region = await this.collection.findOne({ zip });

        return region ? this.hydrate(region) : undefined;
    }

    async findByCity(city: string): Promise<Region | undefined> {
        const region = await this.collection.findOne({ city });

        return region ? this.hydrate(region) : undefined;
    }

    private hydrate(data: any): Region {
        const region = new Region(
            data.id,
            data.zillowId,
            data.country,
            data.state,
            data.county,
            data.city,
            data.zip,
        );

        region.setUrl(data.url);
        region.setReferer(data.referer);

        return region;
    }
}
