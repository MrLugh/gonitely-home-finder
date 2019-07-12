import * as mongoose from 'mongoose';
import Cache from '../../../Domain/Service/Cache';
import MongooseConnection from '../../../Infrastructure/Persistence/MongooseConnection';
import { injectable } from 'inversify';

@injectable()
export default class MongooseCache implements Cache {
    private collection: mongoose.Collection;

    constructor() {
        this.collection = MongooseConnection.getConnection().collection('cache');
    }

    async get(key: string): Promise<any> {
        const element = await this.collection.findOne({ key });

        return element ? element.value : undefined;
    }

    async has(key: string): Promise<boolean> {
        return !! await this.get(key);
    }

    async put(key: string, value: object): Promise<void> {
        await this.collection.updateOne({ key }, { $set: { value } }, { upsert: true });
    }
}
