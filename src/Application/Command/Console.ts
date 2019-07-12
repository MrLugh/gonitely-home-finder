import 'reflect-metadata';
import * as _ from 'lodash';
import * as program from 'commander';
import AddPropertyCommand from './Property/AddPropertyCommand';
import AddZillowPropertiesByCity from './Property/AddZillowPropertiesByCity';
import AddZillowPropertiesByState from './Property/AddZillowPropertiesByState';
import AddZillowPropertiesByZip from './Property/AddZillowPropertiesByZip';
import AddZillowPropertiesForOpportunityZones from './Property/AddZillowPropertiesForOpportunityZones';
import BootElasticsearch from './Property/BootElasticsearch';
import CompleteZillowRegionsByState from './Region/CompleteZillowRegionsByState';
import GetZillowRegionsByState from './Region/GetZillowRegionsByState';
import IterateProperties from './Property/IterateProperties';
import IterateRegions from './Region/IterateRegions';
import MongooseConnection from '../../Infrastructure/Persistence/MongooseConnection';
import ProcessAirDNARentalInfo from './ShortTermRentalInfo/ProcessAirDNARentalInfo';
import ProcessAttomTaxRateInfo from './TaxRateInfo/ProcessAttomTaxRateInfo';
import ProcessEliotAndMeRentalInfo from './ShortTermRentalInfo/ProcessEliotAndMeRentalInfo';
import ReindexLocations from './Location/ReindexLocations';
import ReindexProperties from './Property/ReindexProperties';
import UpdateZillowProperties from './Property/UpdateZillowProperties';

const states = _.uniq([
  'CA',
  'FL',
  'MD',
  'SC',
  'TN',
  'VA',
  'AL',
  'NV',
  'GA',
  'TX',
  'AK',
  'AZ',
  'AR',
  'CO',
  'CT',
  'DE',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'SD',
  'UT',
  'RI',
  'VT',
  'WA',
  'WV',
  'WI',
  'WY'
]).sort().reverse();

program.version('1.0.0').description('GoNitely - Home Finder');

program.command('boot').action(async () => {
  await BootElasticsearch();
});

program.command('reindexProperties').action(async () => {
  await MongooseConnection.connect();
  await ReindexProperties();
  process.exit();
});

program.command('reindexLocations').action(async () => {
  await MongooseConnection.connect();
  await ReindexLocations();
  process.exit();
});

program.command('addZillowPropertiesByZip').action(async (zip: string) => {
  await MongooseConnection.connect();
  await AddZillowPropertiesByZip(zip);
  process.exit();
});

program
  .command('addZillowPropertiesByCity')
  .action(async (city: string, state: string) => {
    await MongooseConnection.connect();
    await AddZillowPropertiesByCity(city, state);
    process.exit();
  });

program.command('addZillowPropertiesByState').action(async (state: string) => {
  await MongooseConnection.connect();
  await AddZillowPropertiesByState(state);
  process.exit();
});

program.command('processAirDNARentalInfo').action(async () => {
  await MongooseConnection.connect();
  await ProcessAirDNARentalInfo();
  process.exit();
});

program.command('processEliotAndMeRentalInfo').action(async () => {
  await MongooseConnection.connect();
  await ProcessEliotAndMeRentalInfo();
  process.exit();
});

program.command('processAttomTaxRateInfo').action(async () => {
  await MongooseConnection.connect();
  await ProcessAttomTaxRateInfo();
  process.exit();
});

program.command('getZillowRegions').action(async () => {
  await MongooseConnection.connect();
  for (const state of states) {
    await GetZillowRegionsByState(state);
  }
  process.exit();
});

program.command('completeZillowRegions').action(async () => {
  await MongooseConnection.connect();
  for (const state of states) {
    await CompleteZillowRegionsByState(state);
  }
  process.exit();
});

program.command('getPropertiesForOpportunityZones').action(async () => {
  await MongooseConnection.connect();
  await AddZillowPropertiesForOpportunityZones();
  process.exit();
});

program.command('getPropertiesForStates').action(async () => {
  await MongooseConnection.connect();
  for (const state of states) {
    console.log('State', state);
    await AddZillowPropertiesByState(state);
  }
  process.exit();
});

program.command('updateZillowProperties').action(async () => {
  await MongooseConnection.connect();
  await UpdateZillowProperties();
  process.exit();
});

program.command('iterateProperties').action(async () => {
  await MongooseConnection.connect();
  await IterateProperties();
  process.exit();
});

program.command('iterateRegions').action(async () => {
  await MongooseConnection.connect();
  await IterateRegions();
  process.exit();
});

program.command('processProperties').action(async () => {
  await MongooseConnection.connect();
  await AddPropertyCommand();
});

program.parse(process.argv);
