import DomainEvent from '../../../Event/DomainEvent';

export default class PropertyWasRequested implements DomainEvent {
    public static readonly NAME = 'property.requested';

    constructor(private remoteId: string) {}

    name(): string {
        return PropertyWasRequested.NAME;
    }

    date(): Date {
        return new Date;
    }

    getRemoteId(): string {
        return this.remoteId;
    }
}
