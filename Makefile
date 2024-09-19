.PHONY: build start

deploy:
	chmod +x deploy-spcs.sh
	./deploy-spcs.sh

build:
	docker build -t ridesharing_simulator:latest --progress=plain -f simulator/Dockerfile simulator
	docker build -t ridesharing_server:latest --progress=plain -f server/Dockerfile server
	docker build -t ridesharing_web:latest --progress=plain -f web/Dockerfile web

start:
	docker compose up -d

stop:
	docker compose down

keygen:
	chmod +x kafka/keygen.sh
	./kafka/keygen.sh
