import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import MongooseConnection from '../../../../Infrastructure/Persistence/MongooseConnection';
import { injectable } from 'inversify';
import Point from '../../../../Domain/Model/Common/Point';
import OpportunityZoneRepository from '../../../../Domain/Model/OpportunityZone/OpportunityZoneRepository';
import OpportunityZone from '../../../../Domain/Model/OpportunityZone/OpportunityZone';
import Query from '../../../../Domain/Model/Common/Query';
import SearchResource from '../../../../Domain/Model/Common/SearchResult';
import { assert } from 'chai';

@injectable()
export default class MongooseOpportunityZoneRepository
    implements OpportunityZoneRepository {
    private collection: mongoose.Collection;

    constructor() {
        this.collection = MongooseConnection.getConnection().collection(
            'opportunityZones'
        );
    }

    async findOneByPoint(point: Point): Promise<OpportunityZone | undefined> {
        const data = await this.collection.findOne({
            geometry: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [point.longitude, point.latitude]
                    }
                }
            }
        });
        if (!data) {
            return undefined;
        }

        return this.hydrate(data);
    }

    async search(query: Query): Promise<SearchResource<OpportunityZone>> {
        const box = query.getFilter('box');
        let filter = {};
        if (box) {
            const boundingBox = JSON.parse(box);
            assert(boundingBox['north-east'].lat > boundingBox['south-west'].lat);
            assert(boundingBox['north-east'].lon > boundingBox['south-west'].lon);
            const top_right = [boundingBox['north-east'].lon, boundingBox['north-east'].lat];
            const bottom_left = [boundingBox['south-west'].lon, boundingBox['south-west'].lat];
            const botton_right = [bottom_left[0], top_right[1]];
            const top_left = [top_right[0], bottom_left[1]];
            filter = {
                geometry: {
                    $geoIntersects: {
                        $geometry: {
                            type: 'Polygon',
                            coordinates: [[top_left, top_right, botton_right, bottom_left, top_left]],
                            crs: {
                                type: 'name',
                                properties: { name: 'urn:x-mongodb:crs:strictwinding:EPSG:4326' }
                            }
                        }
                    },
                }
            };
        }

        const total = await this.collection.find(filter).count();
        const size = 400;
        const offset = (query.getPage() - 1) * size;
        const opportunityZones = await this.collection.find(filter).skip(offset).limit(size).map((result) => this.hydrate(result)).toArray();
        return new SearchResource<OpportunityZone>(opportunityZones, total);
    }

    async getZips(): Promise<string[]> {
        const zips = await this.collection.distinct('zip', {});
        return  _.uniq(zips);
    }

    private hydrate(data: any): OpportunityZone {

        const opportunityZone = new OpportunityZone(
            data.id,
            data.zip,
            data.geometry
        );

        return opportunityZone;
    }

}