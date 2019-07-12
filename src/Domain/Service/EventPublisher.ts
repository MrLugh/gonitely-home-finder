export default interface EventPublisher {
    publish(key: string, payload: object): Promise<void>;
}
