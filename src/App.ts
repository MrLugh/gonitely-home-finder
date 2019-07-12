import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as mongoose from 'mongoose';
import AddRemotePropertiesByZipAction from './Application/Action/Property/AddRemotePropertiesByZipAction';
import AddRemotePropertyAction from './Application/Action/Property/AddRemotePropertyAction';
import AddRentalInfoToPropertyAction from './Application/Action/Property/AddRentalInfoToPropertyAction';
import ErrorHandler from './Application/ErrorHandler';
import GetOpportunityZonesAction from './Application/Action/OpportunityZone/GetOpportunityZonesAction';
import GetLocationsAction from './Application/Action/Location/GetLocationsAction';
import GetPropertiesAction from './Application/Action/Property/GetPropertiesAction';
import GetPropertyAction from './Application/Action/Property/GetPropertyAction';
import JsonApiQuery from './Infrastructure/Service/JsonApiQuery';
import MongooseConnection from './Infrastructure/Persistence/MongooseConnection';
import { NextFunction } from 'express-serve-static-core';

declare global {
    namespace Express {
        interface Request {
            query: JsonApiQuery;
        }
    }
}

class App {
    private express: express.Application;

    constructor() {
        this.express = express();
        this.setupGlobalMiddleware();
        this.setupRoutes();
        this.setupErrorHandler();
    }

    async boot(): Promise<mongoose.Connection> {
        return await MongooseConnection.connect();
    }

    server(): express.Application {
        return this.express;
    }

    private setupGlobalMiddleware() {
        this.express.use(bodyParser.json({ type: 'application/json', limit: '5mb' }));
        this.express.use(compression());
        this.express.get('/health', (request, response) => { response.send(); });
        this.express.use((request, response, next) => {
            request.query = JsonApiQuery.fromRequest(request);
            next();
        });
    }

    private setupRoutes(): void {
        const router = express.Router();

        router.get('/properties', this.catchAsync(GetPropertiesAction));
        router.get('/properties/:id', this.catchAsync(GetPropertyAction));
        router.get('/locations', this.catchAsync(GetLocationsAction));
        router.get('/opportunity-zones', this.catchAsync(GetOpportunityZonesAction));


        router.get('/admin/properties/:id', this.catchAsync(AddRemotePropertyAction));
        router.get('/admin/properties/:id/rental-information', this.catchAsync(AddRentalInfoToPropertyAction));
        router.get('/admin/zip/:zip', this.catchAsync(AddRemotePropertiesByZipAction));

        this.express.use('/', router);
    }

    private setupErrorHandler(): void {
        this.express.use(ErrorHandler);
    }

    private catchAsync(fn: any) {
        return function(request: any, response: any, next: NextFunction) {
            fn(request, response, next).catch(next);
        };
    }
}

export default new App();
