import * as amqplib from 'amqplib';
import DI from '../../../DI';
import logger from '../../Logger';
import Settings from '../../../Settings';

interface AddPropertyPayload {
    remoteId: string;
}

export default async function AddPropertyCommand() {
    const connection = await amqplib.connect(Settings.get('rabbitmq_host'));
    const channel = await connection.createChannel();
    await channel.prefetch(1);
    const exchange = Settings.get('rabbitmq_exchange');
    await channel.assertExchange(exchange, Settings.get('rabbitmq_exchange_type'), {
        durable: true,
    });

    const queue = Settings.get('rabbitmq_queue_properties_worker');
    await channel.assertQueue(queue);
    await channel.bindQueue(queue, exchange, 'property.requested');
    logger.info(`Worker bound to ${queue}`);
    const useCase = DI.addRemoteProperty();
    logger.info('Add Property Worker Started!');
    await channel.consume(queue, async (message: any) => {
        try {
            const data: AddPropertyPayload = JSON.parse(message.content.toString());

            await useCase.execute({ id: data.remoteId });
            logger.info('Successfully added property. ACK', message);
            channel.ack(message);
        } catch (e) {
            logger.error('Error while trying to process job: ', e.message);
            channel.nack(message);
            process.exit();
        }
    });
}
