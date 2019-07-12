export default interface DomainEvent {
    name(): string;
    date(): Date;
}
