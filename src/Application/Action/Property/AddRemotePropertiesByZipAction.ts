import DI from '../../../DI';
import { Request, Response } from 'express';

export default async function AddRemotePropertiesByZipAction(request: Request, response: Response) {
    const properties = await DI.addRemotePropertiesByZip().execute({ zip: request.params.zip });

    response.status(200).json({
        data: properties,
        meta: {
            total: properties.length,
        },
    });
}
