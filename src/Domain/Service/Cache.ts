export default interface Cache {
    get(key: string): Promise<any>;
    has(key: string): Promise<boolean>;
    put(key: string, value: any): Promise<void>;
}
