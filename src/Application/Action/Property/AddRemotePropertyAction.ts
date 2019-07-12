import DI from '../../../DI';
import { Request, Response } from 'express';
import PropertySerializer from '../../Serializer/PropertySerializer';

export default async function AddRemotePropertyAction(request: Request, response: Response) {
    const property = await DI.addRemoteProperty().execute({ id: request.params.id });

    response.status(201).json({
        data: new PropertySerializer(property).serialize(),
    });
}
