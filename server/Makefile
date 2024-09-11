.PHONY: clean run test

clean:
	go clean
	go mod tidy
	rm *.out
	rm coverage.html

run:
	chmod +x scripts/run.sh
	./scripts/run.sh