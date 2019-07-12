import Region from './Region';

export default interface RegionRepository {
    findByIdOrFail(id: string): Promise<Region>;
    findByRemoteId(remoteId: string): Promise<Region | undefined>;
    findByZip(zip: string): Promise<Region | undefined>;
    findByCity(city: string): Promise<Region | undefined>;
    findAll(): Promise<Region[]>;
    findZipsByCity(city: string, state: string): Promise<Region[]>;
    findZipsByState(state: string): Promise<Region[]>;
    getStates(): Promise<string[]>;
    getZipsByCity(city: string, state: string): Promise<string[]>;
    getZipsByState(state: string): Promise<string[]>;
    save(region: Region): Promise<Region>;
    total(): Promise<number>;
}
