export default class SearchResource<T> {
    constructor(
        private collection: T[],
        private total: number,
        private meta: { [key: string]: any } = {},
    ) {}

    getCollection(): T[] {
        return this.collection;
    }

    getTotal(): number {
        return this.total;
    }

    getMeta(): any {
        return this.meta;
    }
}
