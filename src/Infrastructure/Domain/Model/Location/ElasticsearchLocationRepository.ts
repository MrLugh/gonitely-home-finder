import * as elasticsearch from 'elasticsearch';
import ElasticsearchClient from '../../../Persistence/ElasticsearchClient';
import Location from '../../../../Domain/Model/Location/Location';
import LocationDocument from '../../../Persistence/LocationDocument';
import LocationRepository from '../../../../Domain/Model/Location/LocationRepository';
import NotFoundError from '../../../../Domain/Exception/NotFoundError';
import Property from '../../../../Domain/Model/Property/Property';
import Query from '../../../../Domain/Model/Common/Query';
import SearchResource from '../../../../Domain/Model/Common/SearchResult';
import { injectable } from 'inversify';
import capitalize from '../../../../Application/Helper/Capitalize';

@injectable()
export default class ElasticsearchLocationRepository implements LocationRepository {
    private client: elasticsearch.Client;

    private states: { [key: string]: string } = {
        'AL': 'Alabama',
        'AK': 'Alaska',
        'AZ': 'Arizona',
        'AR': 'Arkansas',
        'CA': 'California',
        'CO': 'Colorado',
        'CT': 'Connecticut',
        'DE': 'Delaware',
        'FL': 'Florida',
        'GA': 'Georgia',
        'HI': 'Hawaii',
        'ID': 'Idaho',
        'IL': 'Illinois',
        'IN': 'Indiana',
        'IA': 'Iowa',
        'KS': 'Kansas',
        'KY': 'Kentucky',
        'LA': 'Louisiana',
        'ME': 'Maine',
        'MD': 'Maryland',
        'MA': 'Massachusetts',
        'MI': 'Michigan',
        'MN': 'Minnesota',
        'MS': 'Mississippi',
        'MO': 'Missouri',
        'MT': 'Montana',
        'NE': 'Nebraska',
        'NV': 'Nevada',
        'NH': 'New Hampshire',
        'NJ': 'New Jersey',
        'NM': 'New Mexico',
        'NY': 'New York',
        'NC': 'North Carolina',
        'ND': 'North Dakota',
        'OH': 'Ohio',
        'OK': 'Oklahoma',
        'OR': 'Oregon',
        'PA': 'Pennsylvania',
        'RI': 'Rhode Island',
        'SC': 'South Carolina',
        'SD': 'South Dakota',
        'TN': 'Tennessee',
        'TX': 'Texas',
        'UT': 'Utah',
        'VT': 'Vermont',
        'VA': 'Virginia',
        'WA': 'Washington',
        'WV': 'West Virginia',
        'WI': 'Wisconsin',
        'WY': 'Wyoming',
    };

    constructor() {
        this.client = ElasticsearchClient.getClient();
    }

    async findByIdOrFail(id: string): Promise<Location> {
        try {
            return this.hydrateLocation(
                await this.client.get<IndexedLocation>({
                    index: LocationDocument.ES_INDEX,
                    type: LocationDocument.ES_TYPE,
                    id: id,
                })
            );
        } catch (err) {
            throw new NotFoundError('Location not found');
        }
    }

    async findAll(offset = 0, limit = 10000): Promise<SearchResource<Location>> {
        const response = await this.client.search<IndexedLocation>({
            index: LocationDocument.ES_INDEX,
            type: LocationDocument.ES_TYPE,
            from: offset,
            size: Math.min(Math.abs(limit), 10000),
        });

        const collection = response.hits.hits.map(propertyData => this.hydrateLocation(propertyData));

        return new SearchResource<Location>(collection, response.hits.total);
    }

    async search(query: Query): Promise<SearchResource<Location>> {
        const filters: any[] = [];
        filters.push({match: {country: 'US'}});

        if (query.getFilter('q')) {
            filters.push({
                match: {
                    'description.autocomplete': {
                        query: query.getFilter('q'),
                        fuzziness: 'AUTO',
                        operator: 'and',
                    },
                },
            });
        }

        if (query.getFilter('city')) {
            filters.push({ match: { 'city.exact': query.getFilter('city') } });
        }

        const response = await this.client.search<IndexedLocation>({
            index: LocationDocument.ES_INDEX,
            type: LocationDocument.ES_TYPE,
            body: {
                query: {
                    bool: {
                        must: filters,
                    },
                },
            },
            from: query.getOffset(),
            size: query.getLimit(),
        });

        const collection = response.hits.hits.map(regionData => this.hydrateLocation(regionData));

        return new SearchResource<Location>(collection, response.hits.total);
    }

    async save(location: Location): Promise<Location> {
        if ('state' === location.getType()) {
            location.setDescription(this.states[location.getState()] || location.getState());
        }

        const from: any = {
            type: location.getType(),
            state: location.getState(),
            'description.exact': location.getDescription(),
        };

        if ( ! (await this.exists(from))) {
            await this.client.index(new LocationDocument(location).serialize());
            await this.client.indices.refresh({ index: LocationDocument.ES_INDEX });
        }

        return await location;
    }

    async update(regionId: string, options: { [key: string]: any }): Promise<void> {
        await this.client.update({
            index: LocationDocument.ES_INDEX,
            type: LocationDocument.ES_TYPE,
            id: regionId,
            body: {
                doc: options,
            },
        });
    }

    async exists(options: { [key: string]: any }): Promise<boolean> {
        const filters: any[] = [];
        for (const key in options) {
            const tmp: any = {match: {}};
            tmp.match[key] = options[key];
            filters.push(tmp);
        }

        const response = await this.client.search<IndexedLocation>({
            index: LocationDocument.ES_INDEX,
            type: LocationDocument.ES_TYPE,
            body: {
                query: {
                    bool: {
                        must: filters,
                    },
                },
            },
        });

        return response.hits.hits.length > 0;
    }

    async saveFromProperty(property: Property): Promise<void> {
        const propertyCounty = property.getCounty() ? capitalize(property.getCounty()) : undefined;
        const propertyCity = property.getCity() ? capitalize(property.getCity()) : undefined;

        await this.save(
            new Location(
                property.getCountry(),
                property.getState(),
            )
        );

        await this.save(
            new Location(
                property.getCountry(),
                property.getState(),
                propertyCounty,
            )
        );

        await this.save(
            new Location(
                property.getCountry(),
                property.getState(),
                propertyCounty,
                propertyCity,
            )
        );

        await this.save(
            new Location(
                property.getCountry(),
                property.getState(),
                propertyCounty,
                propertyCity,
                property.getZip(),
            )
        );

        await this.save(
            new Location(
                property.getCountry(),
                property.getState(),
                propertyCounty,
                propertyCity,
                property.getZip(),
                property.getStreet(),
            )
        );
    }

    async getLocationByZipCode(zipCode: string): Promise<Location> {
        const response = await this.client.search<IndexedLocation>({
            index: LocationDocument.ES_INDEX,
            type: LocationDocument.ES_TYPE,
            body: {
                query: {
                    bool: {
                        must: {
                                match: {
                                    'zip': zipCode,
                                },
                        },
                        must_not: {
                            exists: {
                                field: 'street',
                            },
                        }
                    },
                },
            },
        });

        const collection = response.hits.hits.map(regionData => this.hydrateLocation(regionData));

        return collection[0];
    }

    async getZips(): Promise<{ [key: string]: { zip: string, zillowId: string} }> {
        const response = await this.client.search<IndexedLocation>({
            index: LocationDocument.ES_INDEX,
            type: LocationDocument.ES_TYPE,
            body: {
                _source: ['zillowId', 'zip'],
                query: {
                    bool: {
                        must: {
                            exists: {
                                field: 'zip',
                            },
                        },
                        must_not: {
                            exists: {
                                field: 'street',
                            },
                        },
                    },
                },
            },
            from: 0,
            size: 10000,
        });

        const zips: { [key: string]: any } = {};
        response.hits.hits.reduce((acc, object) => {
            acc[object._id] = {
                zip: object._source.zip,
            };
            return acc;
        }, zips);

        return zips;
    }

    private hydrateLocation(regionData: any): Location {
        const data: IndexedLocation = regionData._source;

        return new Location(
            data.country,
            data.state,
            data.county,
            data.city,
            data.zip,
            data.street,
        );
    }
}
