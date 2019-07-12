import DI from '../../../DI';
import PropertySerializer from '../../Serializer/PropertySerializer';
import { Request, Response } from 'express';

export default async function AddRentalInfoToPropertyAction(request: Request, response: Response) {
    const property = await DI.addRentalInfoToProperty().execute({ id: request.params.id });

    response.status(200).json({
        data: new PropertySerializer(property).serialize(),
    });
}
