import RemoteProperty from './RemoteProperty';

export default interface RemotePropertyRepository {
    findById(id: string): Promise<RemoteProperty>;
    findIdsByZip(zip: string): Promise<string[]>;
    findIdsByCity(city: string): Promise<string[]>;
}
