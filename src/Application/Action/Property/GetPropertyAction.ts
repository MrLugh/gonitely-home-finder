import DI from '../../../DI';
import PropertySerializer from '../../Serializer/PropertySerializer';
import { Request, Response } from 'express';

export default async function GetPropertyAction(request: Request, response: Response) {
    const property = await DI.getProperty().execute({ id: request.params.id, query: request.query });

    response.status(200).json({
        data: new PropertySerializer(property).serialize(),
    });
}
