# GoNitely Home Finder

#### Install
```sh
npm install
```

#### Run
```sh
node run watch
```

#### Elasticsearch management
```sh
node dist/Application/Command/Console.js boot
node dist/Application/Command/Console.js reindexProperties
node dist/Application/Command/Console.js reindexLocations
```

#### Zillow commands
```sh
node dist/Application/Command/Console.js getZillowRegions
node dist/Application/Command/Console.js addZillowPropertiesByZip
node dist/Application/Command/Console.js addZillowPropertiesByCity
node dist/Application/Command/Console.js addZillowPropertiesByState
```

#### Short term rental information commands
```sh
node dist/Application/Command/Console.js processAirDNARentalInfo
node dist/Application/Command/Console.js processEliotAndMeRentalInfo
```

#### Tax rate information commands
```sh
node dist/Application/Command/Console.js processAttomTaxRateInfo
```

#### Workers
```sh
node dist/Application/Command/Console.js processProperties
```

#### Elasticsearch
https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html

##### Dump Elastic to localhost
```sh
node dist/Application/Command/Console.js boot
elasticdump --input=https://vuqm2nipzg:zkkqtvs2kp@homefinder-staging-c-1346707644.us-west-2.bonsaisearch.net/properties --output=http://localhost:9200/properties --type=data
elasticdump --input=https://vuqm2nipzg:zkkqtvs2kp@homefinder-staging-c-1346707644.us-west-2.bonsaisearch.net/locations --output=http://localhost:9200/locations --type=data
```

##### Dump Elastic to file
```sh
elasticdump --input=https://vuqm2nipzg:zkkqtvs2kp@homefinder-staging-c-1346707644.us-west-2.bonsaisearch.net/properties --output=data/properties.json --type=data
elasticdump --input=https://vuqm2nipzg:zkkqtvs2kp@homefinder-staging-c-1346707644.us-west-2.bonsaisearch.net/locations --output=data/locations.json --type=data
```

##### Fresh
```sh
node dist/Application/Command/Console.js boot
elasticdump --input=data/properties.json --output=http://localhost:9200/properties --type=data
elasticdump --input=data/locations.json --output=http://localhost:9200/locations --type=data
```

#### Mongo
```sh
make mongo
use home-finder
db.createCollection("properties")
db.createCollection("regions")
```

##### Mongo Export
```sh
docker exec -i home-finder-mongodb mongoexport --uri mongodb://mongodb:27017/home-finder --collection properties > data/properties-mongo.json
```

##### Mongo Import
```sh
cat data/properties-mongo.json |  docker exec -i home-finder-mongodb mongoimport --uri mongodb://mongodb:27017/home-finder --collection properties
```

#### Tests
```sh
npm test
```

#### SSL
https://medium.com/@maninder.bindra/auto-provisioning-of-letsencrypt-tls-certificates-for-kubernetes-services-deployed-to-an-aks-52fd437b06b0

```sh
helm install -n staging --name nginx-ingress stable/nginx-ingress --set rbac.create=true --set ingressShim.extraArgs='{--default-issuer-name=letsencrypt-production,--default-issuer-kind=ClusterIssuer}'

helm del --purge nginx-ingress
```
