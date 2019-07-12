import ElasticsearchClient from '../../../Infrastructure/Persistence/ElasticsearchClient';
import Settings from '../../../Settings';

export default async function BootElasticsearch() {
    const shards = 'production' === Settings.get('environment') ? 5 : 1;
    const replicas = 'production' === Settings.get('environment') ? 1 : 0;

    const client = ElasticsearchClient.getClient();

    try {
        await client.indices.delete({
            index: 'properties',
        });

        await client.indices.delete({
            index: 'locations',
        });
    } catch (error) {
        //
    }

    try {
        await client.indices.create({
            index: 'properties',
            body: {
                settings: {
                    number_of_shards: shards,
                    number_of_replicas: replicas,
                    analysis: {
                        filter: {
                            autocomplete: {
                                type: 'edge_ngram',
                                min_gram: 3,
                                max_gram: 20,
                                token_chars: ['letter', 'digit'],
                            },
                        },
                        analyzer: {
                            search: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: ['lowercase', 'asciifolding'],
                            },
                            autocomplete: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: ['lowercase', 'asciifolding', 'autocomplete'],
                            },
                            exact: {
                                tokenizer: 'keyword',
                                filter: ['lowercase', 'asciifolding'],
                            },
                        },
                        normalizer: {
                            exact: {
                                type: 'custom',
                                filter: ['lowercase', 'asciifolding'],
                            },
                        },
                    },
                },
                mappings: {
                    property: {
                        properties: {
                            zillowId: {
                                type: 'text',
                                fields: {
                                    exact: { type: 'keyword', normalizer: 'exact' },
                                },
                            },
                            country: {
                                type: 'text',
                                fields: {
                                    exact: { type: 'keyword', normalizer: 'exact' },
                                },
                            },
                            state: {
                                type: 'text',
                                fields: {
                                    exact: { type: 'keyword', normalizer: 'exact' },
                                    search: { type: 'text', analyzer: 'search' },
                                    autocomplete: { type: 'text', analyzer: 'autocomplete' },
                                },
                            },
                            county: {
                                type: 'text',
                                fields: {
                                    exact: { type: 'keyword', normalizer: 'exact' },
                                    search: { type: 'text', analyzer: 'search' },
                                    autocomplete: { type: 'text', analyzer: 'autocomplete' },
                                },
                            },
                            city: {
                                type: 'text',
                                fields: {
                                    exact: { type: 'keyword', normalizer: 'exact' },
                                    search: { type: 'text', analyzer: 'search' },
                                    autocomplete: { type: 'text', analyzer: 'autocomplete' },
                                },
                            },
                            zip: {
                                type: 'text',
                                fields: {
                                    exact: { type: 'keyword', normalizer: 'exact' },
                                },
                            },
                            street: {
                                type: 'text',
                                fields: {
                                    exact: { type: 'keyword', normalizer: 'exact' },
                                },
                            },
                            price: { type: 'long' },
                            zEstimate: { type: 'long' },
                            bedrooms: { type: 'short' },
                            bathrooms: { type: 'short' },
                            sqft: { type: 'integer' },
                            year: { type: 'short' },
                            picture: { type: 'text' },
                            location: { type: 'geo_point' },
                            occupancyRate: { type: 'float' },
                            averageDailyRate: { type: 'float' },
                            revenue: { type: 'float' },
                            isOpportunityZone: { type: 'boolean' },
                        },
                    },
                },
            },
        });

        await client.indices.create({
            index: 'locations',
            body: {
                settings: {
                    number_of_shards: shards,
                    number_of_replicas: replicas,
                    analysis: {
                        filter: {
                            autocomplete: {
                                type: 'edge_ngram',
                                min_gram: 3,
                                max_gram: 20,
                                token_chars: ['letter', 'digit'],
                            },
                        },
                        analyzer: {
                            search: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: ['lowercase', 'asciifolding'],
                            },
                            autocomplete: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: ['lowercase', 'asciifolding', 'autocomplete'],
                            },
                            exact: {
                                tokenizer: 'keyword',
                                filter: ['lowercase', 'asciifolding'],
                            },
                        },
                        normalizer: {
                            exact: {
                                type: 'custom',
                                filter: ['lowercase', 'asciifolding'],
                            },
                        },
                    },
                },
                mappings: {
                    location: {
                        properties: {
                            zillowId: { type: 'text' },
                            country: { type: 'text' },
                            state: { type: 'text' },
                            county: {
                                type: 'text',
                                fields: {
                                    exact: { type: 'keyword', normalizer: 'exact' },
                                    search: { type: 'text', analyzer: 'search' },
                                    autocomplete: { type: 'text', analyzer: 'autocomplete' },
                                },
                            },
                            city: {
                                type: 'text',
                                fields: {
                                    exact: { type: 'keyword', normalizer: 'exact' },
                                    search: { type: 'text', analyzer: 'search' },
                                    autocomplete: { type: 'text', analyzer: 'autocomplete' },
                                },
                            },
                            zip: { type: 'text' },
                            description: {
                                type: 'text',
                                fields: {
                                    exact: { type: 'keyword', normalizer: 'exact' },
                                    search: { type: 'text', analyzer: 'search' },
                                    autocomplete: { type: 'text', analyzer: 'autocomplete' },
                                },
                            },
                        },
                    },
                },
            },
        });

    } catch (error) {
        console.log(error.message);
    }
}
