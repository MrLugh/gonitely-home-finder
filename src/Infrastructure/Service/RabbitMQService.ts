import * as amqplib from 'amqplib';
import EventPublisher from '../../Domain/Service/EventPublisher';
import Settings from '../../Settings';
import { injectable } from 'inversify';

@injectable()
export default class RabbitMQService implements EventPublisher {
    private connection?: amqplib.Connection;
    private channel?: amqplib.Channel;
    private exchange: string;

    constructor() {
        this.exchange = Settings.get('rabbitmq_exchange');
    }

    async publish(routingKey: string, payload: object): Promise<void> {
        await this.init();

        if ( ! this.channel) {
            return;
        }

        await this.channel.publish(this.exchange, routingKey, new Buffer(JSON.stringify(payload)));
    }

    private async init() {
        this.connection = await amqplib.connect(Settings.get('rabbitmq_host'));
        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange(this.exchange, Settings.get('rabbitmq_exchange_type'), { durable: true });
    }
}
