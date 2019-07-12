import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import capitalize from '../../../../Application/Helper/Capitalize';
import JsonApiQuery from '../../../Service/JsonApiQuery';
import MongooseConnection from '../../../../Infrastructure/Persistence/MongooseConnection';
import NotFoundError from '../../../../Domain/Exception/NotFoundError';
import Property from '../../../../Domain/Model/Property/Property';
import PropertyReadRepository from '../../../../Domain/Model/Property/PropertyReadRepository';
import PropertyRepository from '../../../../Domain/Model/Property/PropertyRepository';
import PropertySearchResultMeta from '../../../../Domain/Model/Property/PropertySearchResultMeta';
import Query from '../../../../Domain/Model/Common/Query';
import SearchResource from '../../../../Domain/Model/Common/SearchResult';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../Types';

@injectable()
export default class MongoosePropertyRepository implements PropertyRepository {
    private collection: mongoose.Collection;

    constructor(
        @inject(TYPES.PropertyReadRepository) private readRepository: PropertyReadRepository,
    ) {
        this.collection = MongooseConnection.getConnection().collection('properties');
    }

    async findByIdOrFail(id: string): Promise<Property> {
        const data = await this.collection.findOne({ id: id});
        if ( ! data) {
            throw new NotFoundError('Property not found');
        }

        return this.hydrate(data);
    }

    async findByRemoteId(remoteId: string): Promise<Property | undefined> {
        const data = await this.collection.findOne({ zillowId: parseInt(remoteId) });
        if ( ! data) {
            return undefined;
        }

        return this.hydrate(data);
    }

    async findAll(): Promise<Property[]> {
        const collection = await this.collection.find().toArray();

        return collection.map(property => this.hydrate(property));
    }

    async search(query: Query): Promise<SearchResource<Property>> {
        const search = await this.readRepository.search(query);

        const properties: Property[] = [];
        for (const data of search.getCollection()) {
            properties.push(this.hydrate(
                await this.collection.findOne({ id: data.id }),
                data.meta,
            ));
        }

        return new SearchResource(properties, search.getTotal(), search.getMeta());
    }

    async searchById(id: string): Promise<Property> {
        const search = await this.readRepository.search(new JsonApiQuery({ id }));
        if (search.getCollection().length === 0) {
            throw new NotFoundError('Property not found');
        }

        const data = search.getCollection()[0];
        const property = await this.collection.findOne({ id: data.id });
        if (! property) {
            throw new NotFoundError('Property not found');
        }

        return this.hydrate(property, data.meta);
    }

    async save(property: Property): Promise<Property> {
        await this.collection.updateOne(
            { id: property.getId() },
            {
                $set: {
                    zillowId: property.getZillowId(),
                    country: property.getCountry(),
                    state: property.getState(),
                    county: capitalize(property.getCounty() || ''),
                    city: capitalize(property.getCity()),
                    zip: property.getZip(),
                    street: property.getStreet(),
                    price: property.getPrice(),
                    homeStatus: property.getHomeStatus(),
                    homeType: property.getHomeType(),
                    zEstimate: property.getZEstimate(),
                    taxRateInformation: property.getTaxRateInformation(),
                    bedrooms: property.getBedrooms(),
                    bathrooms: property.getBathrooms(),
                    sqft: property.getSquareFeet(),
                    year: property.getYear(),
                    location: {type: 'Point', coordinates: [property.getLongitude(), property.getLatitude()]},
                    picture: property.getPicture(),
                    pictures: property.getPictures(),
                    occupancyRate: property.getOccupancyRate(),
                    averageDailyRate: property.getAverageDailyRate(),
                    revenue: property.getRevenue(),
                    rentalInformation: property.getRentalInformation(),
                    mortgageData: property.getMortgageData(),
                    opportunityZoneId: property.getOpportunityZoneId(),
                },
            },
            { upsert: true },
        );

        // FIXME
        // await this.readRepository.save(property);

        return await property;
    }

    async delete(property: Property): Promise<void> {
        await this.collection.deleteOne({id: property.getId()});
    }

    async findZipsInOpportunityZones(): Promise<string[]> {
        const zips = await this.collection.distinct('zip', {opportunityZoneId: {$ne: undefined}});
        return  _.uniq(zips);
    }

    async total(): Promise<number> {
        return await this.collection.countDocuments();
    }

    private hydrate(data: any, meta?: PropertySearchResultMeta): Property {
        const property = new Property(
            data.id,
            data.zillowId,
            data.country,
            data.state,
            capitalize(data.county || ''),
            capitalize(data.city),
            data.zip,
            data.street,
            data.price,
            data.zEstimate,
            data.bedrooms,
            data.bathrooms,
            data.sqft,
            data.year,
            {latitude: data.location.coordinates[1], longitude: data.location.coordinates[0]},
            data.picture,
            data.homeStatus,
            data.homeType,
        );
        property.setOpportunityZoneId(data.opportunityZoneId);
        property.setPictures(data.pictures);
        property.setRentalInformation(data.rentalInformation || []);
        property.setTaxRateInformation(data.taxRateInformation || []);
        property.setMortgageData(data.mortgageData);

        if (meta) {
            property.setScore(meta.score);
            property.setCapRate(meta.capRate);
            property.setCashOnCashReturn(meta.cashOnCashReturn);
        }

        return property;
    }
}
