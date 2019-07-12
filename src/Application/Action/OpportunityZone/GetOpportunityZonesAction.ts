import DI from '../../../DI';
import { Request, Response } from 'express';
import OpportunityZoneSerializer from '../../Serializer/OpportunityZoneSerializer';

export default async function GetOpportunityZonesAction(request: Request, response: Response) {
    const search = await DI.getOpportunityZones().execute({ query: request.query });
    const meta = search.getMeta();
    meta.total = search.getTotal();

    const geojson = {
        'type': 'FeatureCollection',
        'features': search.getCollection().map(opportunityZone => {
            return {
                type: 'Feature',
                geometry: opportunityZone.getGeometry(),
                properties: (new OpportunityZoneSerializer(opportunityZone)).serialize()
            };
            // (new OpportunityZoneSerializer(opportunityZone)).serialize()
        })
    };
    response.status(200).json(geojson);
    /*
    response.status(200).json({
        data: search.getCollection().map(opportunityZone => (new OpportunityZoneSerializer(opportunityZone)).serialize()),
        meta,
    });
    */
}
