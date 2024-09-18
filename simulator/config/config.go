package config

import (
	"log"
	"os"
	"slices"
	"strconv"

	"github.com/jaswdr/faker/v2"
)

var numRiders = os.Getenv("NUM_RIDERS")
var numDrivers = os.Getenv("NUM_DRIVERS")

var NumRiders = 100
var NumDrivers = 70

var City = os.Getenv("CITY")
var ValidCities = []string{
	"Cupertino",
	"Daly City",
	"Fremont",
	"Hayward",
	"Milpitas",
	"Mountain View",
	"Oakland",
	"Palo Alto",
	"Redwood City",
	"San Bruno",
	"San Francisco",
	"San Jose",
	"San Leandro",
	"San Mateo",
	"Santa Clara",
	"Sunnyvale",
	"Union City",
}

var Faker = faker.New()

var Kafka = struct {
	Broker       string
	SASLUsername string
	SASLPassword string
}{
	Broker:       os.Getenv("KAFKA_BROKER"),
	SASLUsername: os.Getenv("KAFKA_SASL_USERNAME"),
	SASLPassword: os.Getenv("KAFKA_SASL_PASSWORD"),
}

func Verify() {
	if num, err := strconv.ParseInt(numRiders, 10, 64); err == nil {
		NumRiders = int(num)
	}
	if num, err := strconv.ParseInt(numDrivers, 10, 64); err == nil {
		NumDrivers = int(num)
	}
	if !slices.Contains(ValidCities, City) {
		log.Println("Invalid city, defaulting to San Francisco")
		City = "San Francisco"
	}
	log.Printf("Starting simulation with %d riders and %d drivers in %s", NumRiders, NumDrivers, City)
}
