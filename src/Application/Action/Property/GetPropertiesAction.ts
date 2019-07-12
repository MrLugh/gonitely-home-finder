import DI from '../../../DI';
import PropertySerializer from '../../Serializer/PropertySerializer';
import { Request, Response } from 'express';

export default async function GetPropertiesAction(request: Request, response: Response) {
    const search = await DI.getProperties().execute({ query: request.query });

    const meta = search.getMeta();
    meta.total = search.getTotal();

    response.status(200).json({
        data: search.getCollection().map(property => (new PropertySerializer(property)).serialize()),
        meta,
    });
}
