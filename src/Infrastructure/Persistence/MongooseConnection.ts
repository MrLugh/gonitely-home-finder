import * as mongoose from 'mongoose';
import Settings from '../../Settings';

class MongooseConnection {
    private connection: any;

    async connect(): Promise<mongoose.Connection> {
        const mongooseObject = await mongoose.connect(
            Settings.get('mongodb_uri'),
            { useNewUrlParser: true },
        );

        const connection = mongooseObject.connection;

        connection.on('error', () => {
            console.error('Mongoose connection: error');
        });

        connection.on('disconnected', () => {
            console.error('Mongoose connection: disconnected');
        });

        this.connection = connection;

        return await this.connection;
    }

    getConnection(): mongoose.Connection {
        return this.connection;
    }
}

export default new MongooseConnection();
