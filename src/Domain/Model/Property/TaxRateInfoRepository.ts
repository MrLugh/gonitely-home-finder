import Property from './Property';
import TaxRateInfo from './TaxRateInfo';

export default interface TaxRateInfoRepository {
    findByProperty(property: Property): Promise<TaxRateInfo[]>;
}
