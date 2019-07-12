import DomainEvent from './DomainEvent';
import DomainEventSubscriber from './DomainEventSubscriber';

class DomainEventPublisher {
    private subscribers: { [index: string]: DomainEventSubscriber } = {};

    subscribe(subscriber: DomainEventSubscriber) {
        this.subscribers[subscriber.id()] = subscriber;
    }

    async publish(event: DomainEvent) {
        for (const key of Object.keys(this.subscribers)) {
            await this.subscribers[key].handle(event);
        }
    }
}

export default new DomainEventPublisher();
