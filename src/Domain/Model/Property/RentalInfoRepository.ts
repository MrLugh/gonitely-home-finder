import Property from './Property';
import RentalInfo from './RentalInfo';

export default interface RentalInfoRepository {
    findByProperty(property: Property): Promise<RentalInfo[]>;
}
