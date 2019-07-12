import * as _ from 'lodash';
import RemoteProperty from './RemoteProperty';
import RentalInfo from './RentalInfo';
import TaxRateInfo from './TaxRateInfo';
import Point from '../Common/Point';

export default class Property {
    private pictures: string[] = [];
    private rentalInformation: RentalInfo[] = [];
    private taxRateInformation: TaxRateInfo[] = [];
    private mortgageData: { [key: string]: number } = {};
    private score: number = 0;
    private capRate: number = 0;
    private cashOnCashReturn: number = 0;
    private opportunityZoneId: number | undefined = undefined;

    constructor(
        private id: string,
        private zillowId: string,
        private country: string,
        private state: string,
        private county: string,
        private city: string,
        private zip: string,
        private street: string,
        private price: number,
        private zEstimate: number,
        private bedrooms: number,
        private bathrooms: number,
        private sqft: number,
        private year: number,
        private location: Point,
        private picture: string | undefined,
        private homeStatus: string,
        private homeType: string,
    ) {

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

    getCounty(): string {
        return this.county;
    }

    getCity(): string {
        return this.city;
    }

    getZip(): string {
        return this.zip;
    }

    getStreet(): string {
        return this.street;
    }

    getPrice(): number {
        return this.price;
    }

    getHomeStatus(): string {
        return this.homeStatus;
    }

    getHomeType(): string {
        return this.homeType;
    }

    getZEstimate(): number {
        return this.zEstimate;
    }

    getBedrooms(): number {
        return this.bedrooms;
    }

    getBathrooms(): number {
        return this.bathrooms;
    }

    getSquareFeet(): number {
        return this.sqft;
    }

    getYear(): number {
        return this.year;
    }

    getLocation(): Point {
        return this.location;
    }

    getLatitude(): number {
        return this.location.latitude;
    }

    getLongitude(): number {
        return this.location.longitude;
    }

    getPicture(): string | undefined {
        return this.picture;
    }

    getOccupancyRate(): number {
        return _.meanBy(
            _.filter(this.rentalInformation, info => info.occupancyRate > 0),
            info => info.occupancyRate,
        );
    }

    getOpportunityZoneId(): number | undefined {
        return this.opportunityZoneId;
    }

    getAverageDailyRate(): number {
        return _.meanBy(
            _.filter(this.rentalInformation, info => info.averageDailyRate > 0),
            info => info.averageDailyRate,
        );
    }

    getRevenue(): number {
        return this.getOccupancyRate() * this.getAverageDailyRate();
    }

    getScore(): number {
        return this.score;
    }

    setLocation(location: Point) {
        this.location = location;
    }

    setScore(score: number): void {
        this.score = score;
    }

    setOpportunityZoneId(opportunityZoneId: number) {
        this.opportunityZoneId = opportunityZoneId;
    }

    getPictures(): string[] {
        return this.pictures;
    }

    setPictures(pictures: string[]): void {
        this.pictures = pictures;
    }

    getMortgageData(): { [key: string]: number } {
        return this.mortgageData;
    }

    setMortgageData(mortgageData: { [key: string]: number }) {
        this.mortgageData = mortgageData;
    }

    getCapRate(): number {
        return this.capRate;
    }

    setCapRate(capRate: number) {
        this.capRate = capRate;
    }

    getCashOnCashReturn(): number {
        return this.cashOnCashReturn;
    }

    setCashOnCashReturn(cashOnCashReturn: number) {
        this.cashOnCashReturn = cashOnCashReturn;
    }

    getRentalInformation(): RentalInfo[] {
        return this.rentalInformation;
    }

    setRentalInformation(rentalInformation: RentalInfo[]): void {
        this.rentalInformation = rentalInformation;
    }

    addRentalInformation(rentalInfo: RentalInfo): void {
        for (const index in this.rentalInformation) {
            const info = this.rentalInformation[index];
            if (info.origin === rentalInfo.origin && info.accuracy === rentalInfo.accuracy) {
                this.rentalInformation[index] = rentalInfo;
                return;
            }
        }

        this.rentalInformation.push(rentalInfo);
    }

    containsRentalInfoFor(origin: string, accuracy: string): boolean {
        return this.rentalInformation
            .filter(rentalInfo => rentalInfo.origin === origin && rentalInfo.accuracy === accuracy)
            .length > 0;
    }

    getTaxRateInformation(): TaxRateInfo[] {
        return this.taxRateInformation;
    }

    setTaxRateInformation(taxRateInformation: TaxRateInfo[]): void {
        this.taxRateInformation = taxRateInformation;
    }

    addTaxRateInformation(taxRateInfo: TaxRateInfo): void {
        for (const index in this.taxRateInformation) {
            const info = this.taxRateInformation[index];
            if (info.origin === taxRateInfo.origin) {
                this.taxRateInformation[index] = taxRateInfo;
                return;
            }
        }

        this.taxRateInformation.push(taxRateInfo);
    }

    containsTaxRateInfoFor(origin: string): boolean {
        return this.taxRateInformation
            .filter(taxRateInfo => taxRateInfo.origin === origin)
            .length > 0;
    }

    getTaxRate(): number {
        return _.meanBy(
            _.filter(this.taxRateInformation, info => info.rate > 0),
            info => info.rate,
        ) || 0;
    }

    getTaxValue(): number {
        return this.getPrice() * this.getTaxRate() / 100;
    }

    isReady() {
        return this.isComplete() && this.getOccupancyRate() > 0 && this.getAverageDailyRate() > 0;
    }

    isComplete(): boolean {
        return this.country.length > 0 &&
            this.state.length > 0 &&
            this.county.length > 0 &&
            this.city.length > 0 &&
            this.street.length > 0 &&
            this.zip.length > 0 &&
            this.price >= 50000 &&
            this.zEstimate > 0 &&
            this.bathrooms > 0 &&
            this.bedrooms > 0 &&
            this.sqft > 0 &&
            this.zEstimate / this.price < 1.3 &&
            ['for_sale'].indexOf(this.homeStatus) !== -1 &&
            ['single_family', 'multi_family', 'townhouse'].indexOf(this.homeType) !== -1;
    }

    rentalInfoProviders(): string[] {
        const acc: string[] = [];
        return this.getRentalInformation().reduce((acc, rentalInfo) => {
            if (rentalInfo.averageDailyRate) {
                return acc.concat([rentalInfo.origin.slice(0, 1).toUpperCase()]);
            }
            return acc;
        }, acc);
    }

    fullAddress(): string {
        return `${this.street}, ${this.city}, ${this.county}, ${this.state}, ${this.zip}`;
    }

    updateFromRemote(remoteProperty: RemoteProperty): void {
        this.country = remoteProperty.country;
        this.state = remoteProperty.state;
        this.county = remoteProperty.county;
        this.city = remoteProperty.city;
        this.zip = remoteProperty.zip;
        this.street = remoteProperty.street;
        this.price = remoteProperty.price;
        this.zEstimate = remoteProperty.zEstimate;
        this.bedrooms = remoteProperty.bedrooms;
        this.bathrooms = remoteProperty.bathrooms;
        this.sqft = remoteProperty.sqft;
        this.year = remoteProperty.year;
        this.location = {latitude: remoteProperty.latitude, longitude: remoteProperty.longitude};
        this.picture = remoteProperty.picture;
        this.homeStatus = remoteProperty.homeStatus;
        this.homeType = remoteProperty.homeType;
        this.setPictures(remoteProperty.pictures);
        this.setMortgageData(remoteProperty.mortgageData);
        this.addTaxRateInformation({
            origin: remoteProperty.provider,
            rate: remoteProperty.taxRate,
        });
    }
}
