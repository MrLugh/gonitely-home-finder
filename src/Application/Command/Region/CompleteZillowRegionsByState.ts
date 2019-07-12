import Automator from '../../../Infrastructure/Service/Automator';
import DI from '../../../DI';
import sleep from '../../../Application/Helper/Sleep';

export default async function CompleteZillowRegionsByState(state: string) {
    const repository = DI.regionRepository();

    const browser = await (new Automator).getBrowser();

    const regions = await repository.findZipsByState(state);
    for (const region of regions) {
        if (region.getUrl() && region.getReferer()) {
            continue;
        }

        const page = await browser.newPage();

        try {
            const zillowUrl = `https://www.zillow.com/homes/${(region.getCity() || '').replace(/\s+/g, '-')}-${region.getState()}-${region.getZip()}_rb/`;
            console.log(zillowUrl);

            await page.goto(zillowUrl, {
                referer: 'https://www.zillow.com/',
            });

            const request = await page.waitForRequest(
                (request: any) => request.url().includes('https://www.zillow.com/search/GetResults.htm'),
                { timeout: 2500 },
            );
            const url = request.url()
                .replace(/&status=[0-9]*/, '&status=100000')
                .replace(/&lt=[0-9]*/, '&lt=110000')
                .replace(/&ht=[0-9]*/, '&ht=100001')
                .replace(/&bd=[0-9]*/, '&bd=1')
                .replace(/&ba=[0-9]*/, '&ba=1')
                .replace(/&pr=[0-9]*/, '&pr=50000')
                .replace(/&search=[a-zA-Z]*/, '&search=list')
                .replace('isMapSearch=1', 'isMapSearch=0')
                .replace(/&p=[0-9]*/, '');

            region.setUrl(url);
            region.setReferer(request.headers()['referer']);

            console.log(region);
            await repository.save(region);

        } catch (err) {
            console.log(err);
        }

        await page.close();

        // await sleep(1000);
    }

    await browser.close();
}
