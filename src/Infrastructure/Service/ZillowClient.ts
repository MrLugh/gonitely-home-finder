import * as _ from 'lodash';
import * as cheerio from 'cheerio';
import * as request from 'request-promise';
import Settings from '../../Settings';
import sleep from '../../Application/Helper/Sleep';
import { ZillowRegionChildrenType } from './ZillowChildtypeEnum';
import Region from '../../Domain/Model/Region/Region';
const parser = require('xml2json');
const numeral = require('numeral');
const UserAgent = require('user-agents');

class ZillowClient {
    private httpClient: typeof request;
    private readonly token: string;
    private baseUrl = 'https://www.zillow.com/webservice/';

    constructor() {
        const proxyUrl = 'http://' + Settings.get('proxy');
        this.httpClient = request.defaults({ proxy: proxyUrl });
        this.token = Settings.get('zillow').access_token;
    }

    async getRegionChildren(
        regionId?: string,
        state?: string,
        county?: string,
        city?: string,
        childtype?: ZillowRegionChildrenType,
    ) {
        const options: { [key: string]: any } = {
            'zws-id': this.token,
        };

        if (regionId) {
            options.regionId = regionId;
        }

        if (state) {
            options.state = state;
        }

        if (county) {
            options.county = county;
        }

        if (city) {
            options.city = city;
        }

        if (childtype) {
            options.childtype = childtype;
        }

        const url = Object.keys(options).reduce((acc, key, index) => {
            return acc + '&' + key + '=' + encodeURIComponent(options[key]);
        }, this.baseUrl + 'GetRegionChildren.htm?');

        const xml = await this.httpClient.get(url);
        const response = JSON.parse(parser.toJson(xml));
        if (response['RegionChildren:regionchildren'].message.code != 0) {
            throw new Error(response['RegionChildren:regionchildren'].message.text);
        }
        return response['RegionChildren:regionchildren'];
    }

    async getZEstimateByRegionName(name: string) {
        const url = 'https://www.zillow.com/homes/' + name + '_rb/';
        const html = await this.httpClient.get(url, {
            followAllRedirects: true,
            headers: {
                Authority: 'www.zillow.com',
                'User-Agent':
                    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
            },
        });

        try {
            const $ = cheerio.load(html, {
                normalizeWhitespace: true,
            });
            $('style').remove();
            $('script').remove();
            if ($('#region-info-footer .zsg-table-col_num').length && $('#region-info-footer .zsg-table-col_num').get(1)) {
                return numeral($('#region-info-footer .zsg-table-col_num').get(1).firstChild.data).value();
            }
            return undefined;
        } catch (err) {
            console.error('getZEstimateByRegionName error', name, err);
            throw err;
        }
    }

    async findPropertyById(id: string): Promise<any> {
        const response = await this.httpClient.post('https://www.zillow.com/graphql/', {
            followAllRedirects: true,
            headers: {
                Authority: 'www.zillow.com',
                Origin: 'https://www.zillow.com',
                'Content-Type': 'text/plain',
                'User-Agent': this.getRandomUserAgent(),
                Referer: 'https://www.zillow.com/',
            },
            body: JSON.stringify({
                operationName: 'ForSaleFullRenderQuery',
                variables: {
                    zpid: id,
                },
                query: `
                    query ForSaleFullRenderQuery($zpid: ID!) {
                        property(zpid: $zpid) {
                            zpid
                            address {
                                streetAddress
                                state
                                city
                                zipcode
                            }
                            city
                            county
                            bathrooms
                            bedrooms
                            latitude
                            longitude
                            price
                            homeStatus
                            homeType
                            photos(size: L, count: 10) {
                                width
                                height
                                url
                            }
                            hugePhotos: photos(size: XXL, count: 10) {
                                width
                                height
                                url
                            }
                            livingArea
                            mortgageData: mortgageRates {
                                fifteenYearFixedRate
                                thirtyYearFixedRate
                                arm5Rate
                            }
                            propertyTaxRate
                            state
                            yearBuilt
                            zestimate
                            zipcode
                        }
                    }
                `,
            }),
        });

        try {
            return JSON.parse(new Buffer(response, 'binary').toString('ascii'));
        } catch (err) {
            throw new Error(`Error: ZillowClient::findPropertyById - Error fetching property`);
        }
    }

    async findPropertyIdsByRegion(region: Region): Promise<any[]> {
        const regionUrl = region.getUrl();
        if ( ! regionUrl) {
            console.error('Missing region URL!');
            return [];
        }

        console.log(`ZillowClient::findPropertyIdsByRegion - Type ${region.getType()} zillowId ${region.getZillowId()}`);

        const response = await this.httpClient.get(regionUrl, this.options(region.getReferer()));
        if (typeof response === 'string') {
            console.error(`Proxy is dead`);
            return [];
        }

        if ( ! response.list) {
            console.error(`Error: ZillowClient::findPropertyIdsByZip - Empty list for region ${region.getZillowId()}`);
            return [];
        }

        const pages = parseInt(response.list.numPages);
        console.log(`Pages: ${pages}`);

        let propertyIds: any[] = [];
        for (let page = 1; page <= pages; page++) {
            try {
                console.log(`- Type ${region.getType()} zillowId ${region.getZillowId()}, page ${page}`);
                await sleep(1000);
                const response = await this.httpClient.get(`${regionUrl}&p=${page}`, this.options(region.getReferer()));
                if ( ! response.list) {
                    console.error(`Error: ZillowClient::findPropertyIdsByZip - Empty list for region ${region.getZillowId()}`);
                    continue;
                }
                propertyIds = propertyIds.concat(response.list.zpids);
            } catch (err) {
                console.error(`Error: ZillowClient::findPropertyIdsByZip - region ${region.getZillowId()} page ${page} ${err.message}`);
            }
        }

        propertyIds = _.uniq(propertyIds);
        console.log(`${propertyIds.length} properties in region`);

        return propertyIds;
    }

    private options(referer?: string): object {
        return {
            json: true,
            followAllRedirects: true,
            headers: {
                Authority: 'www.zillow.com',
                Referer: referer || 'https://www.zillow.com/',
                'User-Agent': this.getRandomUserAgent(),
                'X-Requested-With': 'XMLHttpRequest',
            },
        };
    }

    private getRandomUserAgent(): string {
        return (new UserAgent()).toString();
    }
}

export default new ZillowClient();
