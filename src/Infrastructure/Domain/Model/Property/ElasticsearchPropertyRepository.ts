import * as _ from 'lodash';
import * as elasticsearch from 'elasticsearch';
import ElasticsearchClient from '../../../Persistence/ElasticsearchClient';
import Property from '../../../../Domain/Model/Property/Property';
import PropertyDocument from '../../../Persistence/PropertyDocument';
import PropertyReadRepository from '../../../../Domain/Model/Property/PropertyReadRepository';
import PropertySearchResult from '../../../../Domain/Model/Property/PropertySearchResult';
import Query from '../../../../Domain/Model/Common/Query';
import SearchResource from '../../../../Domain/Model/Common/SearchResult';
import { assert } from 'chai';
import { injectable } from 'inversify';

@injectable()
export default class ElasticsearchPropertyRepository implements PropertyReadRepository {
    private client: elasticsearch.Client;

    constructor() {
        this.client = ElasticsearchClient.getClient();
    }

    async search(query: Query): Promise<SearchResource<PropertySearchResult>> {
        const filters: any[] = [];

        filters.push({ match: { 'country.exact': 'US' } });
        filters.push({ range: { price: { gte: 50000 } } });
        filters.push({ script: { script: `(double) doc['zEstimate'].value / doc['price'].value < 1.3` } });

        for (const exactFilter of ['street', 'zip', 'city', 'county', 'state']) {
            if (query.getFilter(exactFilter)) {
                const key = `${exactFilter}.exact`;
                const object: any = {};
                object[key] = query.getFilter(exactFilter);
                filters.push({ match: object });
            }
        }

        if (query.getFilter('id')) {
            filters.push({ terms: { _id: [query.getFilter('id')] } });
        }

        if (query.getFilter('opportunity-zone')) {
            filters.push({ terms: { isOpportunityZone: [query.getFilter('opportunity-zone')] } });
        }

        const minPrice = query.getFilter('min-price');
        if (minPrice) {
            filters.push({ range: { price: { gte: parseInt(minPrice) } } });
        }

        const maxPrice = query.getFilter('max-price');
        if (maxPrice) {
            filters.push({ range: { price: { lte: parseInt(maxPrice) } } });
        }

        const minSize = query.getFilter('min-sqft');
        if (minSize) {
            filters.push({ range: { sqft: { gte: parseInt(minSize) } } });
        }

        const maxSize = query.getFilter('max-sqft');
        if (maxSize) {
            filters.push({ range: { sqft: { lte: parseInt(maxSize) } } });
        }

        const minBedrooms = query.getFilter('min-bedrooms');
        if (minBedrooms) {
            filters.push({ range: { bedrooms: { gte: parseInt(minBedrooms) } } });
        }

        const maxBedrooms = query.getFilter('max-bedrooms');
        if (maxBedrooms) {
            filters.push({ range: { bedrooms: { lte: parseInt(maxBedrooms) } } });
        }

        const minBathrooms = query.getFilter('min-bathrooms');
        if (minBathrooms) {
            filters.push({ range: { bathrooms: { gte: parseInt(minBathrooms) } } });
        }

        const maxBathrooms = query.getFilter('max-bathrooms');
        if (maxBathrooms) {
            filters.push({ range: { bathrooms: { lte: parseInt(maxBathrooms) } } });
        }

        const minAge = query.getFilter('min-age');
        if (minAge) {
            filters.push({ range: { year: { lte: new Date().getFullYear() - parseInt(minAge) } } });
        }

        const maxAge = query.getFilter('max-age');
        if (maxAge) {
            filters.push({ range: { year: { gte: new Date().getFullYear() - parseInt(maxAge) } } });
        }

        const minAverageDailyRate = query.getFilter('min-adr');
        if (minAverageDailyRate) {
            filters.push({ range: { averageDailyRate: { gte: parseInt(minAverageDailyRate) } } });
        }

        const minCapRate = query.getFilter('min-cap-rate');
        if (minCapRate) {
            filters.push({
                script: {
                    script: {
                        lang: 'painless',
                        source: `
                            double yearlyRevenue = doc['dailyRevenue'].value * 365;
                            double annualIncome = yearlyRevenue;
                            annualIncome -= doc['price'].value * doc['taxRate'].value / 100;
                            annualIncome -= 0.01 * doc['price'].value;
                            annualIncome -= 50 * doc['bedrooms'].value * 12;
                            annualIncome -= yearlyRevenue * 0.25;

                            double purchasePrice = doc['price'].value;

                            double capRate = (annualIncome / purchasePrice) * 100.00;

                            return capRate > params.minCapRate;
                        `,
                        params: {
                            minCapRate: parseInt(minCapRate) || 0,
                        },
                    },
                },
            });
        }

        const zoom = query.getFilter('zoom');
        const zoomLevel = zoom ? Math.min(parseInt(zoom), 20) : 12;

        const box = query.getFilter('box');
        if (box) {
            try {
                const boundingBox = JSON.parse(box);
                assert(boundingBox['north-east'].lat > boundingBox['south-west'].lat);
                assert(boundingBox['north-east'].lon > boundingBox['south-west'].lon);

                filters.push({
                    geo_bounding_box: {
                        location: {
                            top_right: {
                                lat: boundingBox['north-east'].lat,
                                lon: boundingBox['north-east'].lon,
                            },
                            bottom_left: {
                                lat: boundingBox['south-west'].lat,
                                lon: boundingBox['south-west'].lon,
                            },
                        },
                    },
                });
            } catch (err) {
                //
            }
        }

        const response = await this.client.search<IndexedProperty>({
            index: PropertyDocument.ES_INDEX,
            type: PropertyDocument.ES_TYPE,
            body: {
                _source: ['*'],
                script_fields: {
                    capRate: {
                        script: {
                            lang: 'painless',
                            source: this.capRate(),
                        },
                    },
                    cashOnCashReturn: {
                        script: {
                            lang: 'painless',
                            source: this.cashOnCash(),
                            params: {
                                downPayment: parseFloat(query.getFilter('down-payment') || '0'),
                            },
                        },
                    },
                },
                query: {
                    bool: {
                        must: filters,
                    },
                },
                sort: {
                    _script: {
                        type: 'number',
                        script: {
                            lang: 'painless',
                            source: this.score(),
                            params: {
                                year: new Date().getFullYear(),
                            },
                        },
                        order: 'desc',
                    },
                },
                aggs: {
                    grid: {
                        geohash_grid: {
                            field: 'location',
                            precision: this.precisionFor(zoomLevel),
                            size: 50,
                        },
                        aggs: {
                            id: {
                                top_hits: {
                                    _source: {
                                        includes: ['price', 'picture', 'state', 'county', 'city', 'zip', 'street', 'isOpportunityZone']
                                    },
                                    size: 1,
                                },
                            },
                            latitude: {
                                avg: {
                                    script: `doc['location'].lat`,
                                },
                            },
                            longitude: {
                                avg: {
                                    script: `doc['location'].lon`,
                                },
                            },
                        },
                    },
                    min_price: {
                        min: {
                            field: 'price',
                        },
                    },
                    max_price: {
                        max: {
                            field: 'price',
                        },
                    },
                },
            },
            from: query.getOffset(),
            size: query.getLimit(),
        });

        return new SearchResource<PropertySearchResult>(
            response.hits.hits.map(propertyData => {
                return {
                    id: propertyData._id,
                    meta: {
                        score: parseFloat(
                            Number(propertyData.sort ? propertyData.sort[0] : '0').toFixed(2),
                        ),
                        capRate: parseFloat(Number(propertyData.fields.capRate[0]).toFixed(2)),
                        cashOnCashReturn: parseFloat(
                            Number(propertyData.fields.cashOnCashReturn[0]).toFixed(2),
                        ),
                    },
                };
            }),
            response.hits.total,
            {
                map: response.aggregations.grid.buckets.map((point: any) => {
                    const data = point.id.hits.hits[0];
                    const source = data._source;
                    return {
                        id: data._id,
                        price: source.price,
                        picture: source.picture,
                        state: source.state,
                        county: source.county,
                        city: source.city,
                        zip: source.zip,
                        street: source.street,
                        latitude: point.latitude.value,
                        longitude: point.longitude.value,
                        total: point.doc_count,
                        isOpportunityZone: source.isOpportunityZone,
                    };
                }),
                price: {
                    min: response.aggregations.min_price.value,
                    max: response.aggregations.max_price.value,
                },
            },
        );
    }

    async save(property: Property): Promise<Property> {
        await this.client.index(new PropertyDocument(property).serialize());

        return property;
    }

    async saveMany(properties: Property[], chunkSize = 400): Promise<Property[]> {
        for (const collection of _.chunk(properties, chunkSize)) {
            await this.client.bulk({
                body: _.flatMap(collection, property => {
                    const serialized = (new PropertyDocument(property).serialize());
                    return [
                        {
                            index:  {
                                _index: PropertyDocument.ES_INDEX,
                                _type: PropertyDocument.ES_TYPE,
                                _id: serialized.id,
                            },
                        },
                        serialized.body,
                    ];
                }),
            });
        }

        return properties;
    }

    async delete(property: Property): Promise<void> {
        await this.client.delete({
            index: PropertyDocument.ES_INDEX,
            type: PropertyDocument.ES_TYPE,
            id: property.getId(),
        });
    }

    private capRate(): string {
        return `
            double yearlyRevenue = doc['dailyRevenue'].value * 365;
            double annualIncome = yearlyRevenue;
            annualIncome -= doc['price'].value * doc['taxRate'].value / 100;
            annualIncome -= 0.01 * doc['price'].value;
            annualIncome -= 50 * doc['bedrooms'].value * 12;
            annualIncome -= yearlyRevenue * 0.25;

            double purchasePrice = doc['price'].value;

            return (annualIncome / purchasePrice) * 100.00;
        `;
    }

    private cashOnCash(): string {
        return `
            double cashInvested = (double) params.downPayment;
            if (cashInvested > 0 && cashInvested < doc['price'].value) {
                double yearlyRevenue = doc['dailyRevenue'].value * 365;
                double annualIncome = yearlyRevenue;
                annualIncome -= doc['price'].value * doc['taxRate'].value / 100;
                annualIncome -= 0.01 * doc['price'].value;
                annualIncome -= 50 * doc['bedrooms'].value * 12;
                annualIncome -= yearlyRevenue * 0.25;

                double r = doc['mortgageData.thirtyYearFixedRate'].value / 12 / 100;
                double n = 30 * 12;
                double P = doc['price'].value - cashInvested;

                // https://www.wikihow.com/Calculate-Mortgage-Payments
                double monthlyMortgage = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                double annualMortgage = 12 * monthlyMortgage;

                return 100 * (annualIncome - annualMortgage) / cashInvested;

            } else if (cashInvested >= doc['price'].value) {
                ${this.capRate()}
            }

            return 0;
        `;
    }

    private score(): string {
        return `
            double yearlyRevenue = doc['dailyRevenue'].value * 365;
            double annualIncome = yearlyRevenue;
            annualIncome -= doc['price'].value * doc['taxRate'].value / 100;
            annualIncome -= 0.01 * doc['price'].value;
            annualIncome -= 50 * doc['bedrooms'].value * 12;
            annualIncome -= yearlyRevenue * 0.25;

            double purchasePrice = doc['price'].value;
            double propertyCapRate = (annualIncome / purchasePrice) * 100;

            double capRateScore = 3;
            if (propertyCapRate > 30) { capRateScore = 10; }
            else if (propertyCapRate > 20) { capRateScore = 9; }
            else if (propertyCapRate > 18) { capRateScore = 8; }
            else if (propertyCapRate > 16) { capRateScore = 7; }
            else if (propertyCapRate > 14) { capRateScore = 6; }
            else if (propertyCapRate > 12) { capRateScore = 5; }
            else if (propertyCapRate > 10) { capRateScore = 4; }

            double yearsScore = 0;
            if (doc['year'].value > 0) {
                double years = params.year - doc['year'].value;
                if (years < 10) { yearsScore = 10; }
                else if (years < 20) { yearsScore = 9; }
                else if (years < 30) { yearsScore = 8; }
                else if (years < 40) { yearsScore = 7; }
                else if (years < 50) { yearsScore = 6; }
                else if (years < 60) { yearsScore = 5; }
                else if (years < 70) { yearsScore = 4; }
                else if (years < 80) { yearsScore = 3; }
                else if (years < 90) { yearsScore = 2; }
                else if (years < 100) { yearsScore = 1; }
            }

            double sqftScore = 0;
            if (doc['sqft'].value > 0) {
                double sqft = doc['sqft'].value;
                if (sqft > 3000) { sqftScore = 10; }
                else if (sqft > 2500) { sqftScore = 9; }
                else if (sqft > 2000) { sqftScore = 8; }
                else if (sqft > 1500) { sqftScore = 7; }
                else if (sqft > 1250) { sqftScore = 6; }
                else if (sqft > 1000) { sqftScore = 5; }
                else if (sqft > 900) { sqftScore = 4; }
                else if (sqft > 775) { sqftScore = 3; }
                else if (sqft > 650) { sqftScore = 2; }
                else if (sqft > 500) { sqftScore = 1; }
            }

            return capRateScore * 0.9 + sqftScore * 0.05 + yearsScore * 0.05 - 0.1;
        `;
    }

    private precisionFor(zoom: number) {
        switch (zoom) {
            case 20:
            case 19:
                return 12;
            case 18:
                return 11;
            case 17:
                return 10;
            case 16:
                return 9;
            case 15:
                return 8;
            case 14:
            case 13:
                return 6;
            case 12:
            case 11:
            case 10:
                return 5;
            case 9:
                return 4;
            case 8:
            case 7:
            case 6:
            default:
                return 3;
        }
    }
}
