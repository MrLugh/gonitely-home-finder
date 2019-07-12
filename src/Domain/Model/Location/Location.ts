import { v4 as uuid } from 'uuid';

export default class Location {
    private type: string;
    private description: string;

    constructor(
        private country: string,
        private state: string,
        private county?: string,
        private city?: string,
        private zip?: string,
        private street?: string,
    ) {
        if (this.street) {
            this.type = 'street';
            this.description = this.street;
        } else if (this.zip) {
            this.type = 'zip';
            this.description = this.zip;
        } else if (this.city) {
            this.type = 'city';
            this.description = this.city;
        } else if (this.county) {
            this.type = 'county';
            this.description = this.county;
        } else {
            this.type = 'state';
            this.description = this.state;
        }
    }

    getId(): string {
        return uuid();
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

    getStreet(): string | undefined {
        return this.street;
    }

    getZip(): string | undefined {
        return this.zip;
    }

    getType(): string {
        return this.type;
    }

    getDescription(): string {
        return this.description;
    }

    setDescription(description: string): void {
        this.description = description;
    }
}
