import Settings from '../../Settings';

const puppeteerExtra = require('puppeteer-extra');
puppeteerExtra.use(require('puppeteer-extra-plugin-anonymize-ua')());

export default class Automator {
    async getBrowser(): Promise<any> {
        const browser = await puppeteerExtra.launch({
            ignoreHTTPSErrors: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', `--proxy-server=${Settings.get('proxy')}`],
        });
        return browser;
    }
}
