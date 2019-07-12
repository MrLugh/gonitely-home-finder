import DI from '../../../DI';
import LocationSerializer from '../../Serializer/LocationSerializer';
import { Request, Response } from 'express';

export default async function GetLocationsAction(request: Request, response: Response) {
    const search = await DI.getLocations().execute({ query: request.query });
    response.status(200).json({
        data: search.getCollection().map(location => (new LocationSerializer(location)).serialize()),
        meta: {
            total: search.getTotal(),
        },
    });
}
