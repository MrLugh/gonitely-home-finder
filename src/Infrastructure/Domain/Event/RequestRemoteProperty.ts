import DomainEvent from '../../../Domain/Event/DomainEvent';
import DomainEventSubscriber from '../../../Domain/Event/DomainEventSubscriber';
import EventPublisher from '../../../Domain/Service/EventPublisher';
import PropertyWasRequested from '../../../Domain/Model/Property/Event/PropertyWasRequested';

export default class RequestRemoteProperty implements DomainEventSubscriber {
    constructor(private eventPublisher: EventPublisher) {}

    id(): string {
        return 'RequestRemoteProperty';
    }

    async handle(event: DomainEvent): Promise<void> {
        if ( ! (event instanceof PropertyWasRequested)) {
            return;
        }

        await this.eventPublisher.publish('property.requested', {
            remoteId: event.getRemoteId(),
        });
    }
}
