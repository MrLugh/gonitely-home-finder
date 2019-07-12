const uuidv4 = require('uuid/v4');

interface Config {
    elasticsearch_host: string;
    mongodb_uri: string;
    zillow: object;
    airdna: object;
    eliotandme: object;
    attom: object;
    proxy: string;
    rabbitmq: {
        uri: string,
        exchange: string,
        exchange_type: string,
        queue_properties_worker: string,
    };
}

class Settings {
    private settings: { [id: string]: any } = {};

    constructor() {
        const environment = process.env.NODE_ENV || 'dev';
        const instance_name = process.env.POD_NAME || uuidv4();
        const config: Config = require(`${__dirname}/../config/${environment}.json`);

        this.add('environment', environment);
        this.add('instance_name', instance_name);
        this.add('port', process.env.APP_PORT, 3000);

        this.add('proxy', config.proxy);
        this.add('elasticsearch_host', config.elasticsearch_host);
        this.add('mongodb_uri', config.mongodb_uri);
        this.add('zillow', config.zillow);
        this.add('airdna', config.airdna);
        this.add('eliotandme', config.eliotandme);
        this.add('attom', config.attom);

        this.add('rabbitmq_host', config.rabbitmq.uri);
        this.add('rabbitmq_exchange', config.rabbitmq.exchange);
        this.add('rabbitmq_exchange_type', config.rabbitmq.exchange_type);
        this.add('rabbitmq_queue_properties_worker', config.rabbitmq.queue_properties_worker);
    }

    get(key: string): any {
        return this.settings[key];
    }

    private add(key: string, value: any, defaultValue?: any) {
        this.settings[key] = value || defaultValue;
    }
}

export default new Settings();
