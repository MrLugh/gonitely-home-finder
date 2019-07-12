export default class Region {
    private type: string;
    private url?: string;
    private referer?: string;

    constructor(
        private id: string,
        private zillowId: string,
        private country: string,
        private state: string,
        private county?: string,
        private city?: string,
        private zip?: string,
    ) {
        if (this.zip) {
            this.type = 'zip';
        } else if (this.city) {
            this.type = 'city';
        } else if (this.county) {
            this.type = 'county';
        } else {
            this.type = 'state';
        }
    }

    getId(): string {
        return this.id;
    }

    getZillowId(): string {
        return this.zillowId;
    }

    getCountry(): string {
        return this.country;
    }

    getState(): string {
        return this.state;
    }

    getCounty(): string | undefined {
        return this.county;
    }

    getCity(): string | undefined {
        return this.city;
    }

    getZip(): string | undefined {
        return this.zip;
    }

    getType(): string {
        return this.type;
    }

    getUrl(): string | undefined {
        return this.url;
    }

    setUrl(url: string): void {
        this.url = url;
    }

    getReferer(): string | undefined {
        return this.referer;
    }

    setReferer(referer: string): void {
        this.referer = referer;
    }
}
