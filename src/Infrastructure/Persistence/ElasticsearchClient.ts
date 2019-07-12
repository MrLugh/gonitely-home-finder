import * as elasticsearch from 'elasticsearch';
import Settings from '../../Settings';

class ElasticsearchClient {
    private client: elasticsearch.Client;

    constructor() {
        this.client = new elasticsearch.Client({
            host: Settings.get('elasticsearch_host'),
            log: Settings.get('environment') === 'dev' ? 'error' : 'error', // dev: trace
        });
    }

    getClient(): elasticsearch.Client {
        return this.client;
    }
}

export default new ElasticsearchClient();
