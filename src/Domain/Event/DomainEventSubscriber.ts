import DomainEvent from './DomainEvent';

export default interface DomainEventSubscriber {
    id(): string;
    handle(event: DomainEvent): Promise<void>;
}
