.PHONY: up down restart stats boot boot-properties boot-regions boot-airdna-data refresh

MAKEPATH := $(abspath $(lastword $(MAKEFILE_LIST)))
PWD := $(dir $(MAKEPATH))

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	make down && make up

stats:
	docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

mongo:
	docker exec -it home-finder-mongodb mongo home-finder

boot:
	docker exec -it home-finder-api sh -c "node /usr/src/app/dist/Application/Command/Console.js boot"

boot-properties:
	elasticdump --input=data/propertiesDay0.json --output=http://localhost:9200/properties --type=data

boot-regions:
	elasticdump --input=data/regionsDay0.json --output=http://localhost:9200/regions --type=data

boot-airdna-data:
	elasticdump --input=data/airdnaDay0.json --output=http://localhost:9200/airdna_data --type=data

refresh:
	make boot && make boot-properties && make boot-regions && make boot-airdna-data
