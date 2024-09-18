package service

import (
	"log"
	"simulator/config"
	"simulator/database"
	"simulator/exporter"
	"simulator/model"
	"time"
)

// ================================
//  SIMULATION FUNCTIONS
// ================================

func StartRiderLoop(userID string, city string) {
	for {
		UpdateStatusForRider(userID, "idle")
		initLat, initLong := GenerateCoordinateInCity(city)
		UpdateLocationForRider(userID, initLat, initLong)
		sleepTime := time.Duration(config.Faker.IntBetween(500, 20000)*getTimeMultiplier(city)) * time.Millisecond
		log.Printf("Rider %s is idle for %s\n", userID, sleepTime)
		time.Sleep(sleepTime)
		tripID := RequestRide(userID, city)
		if tripID == "" {
			log.Printf("Rider %s failed to request ride\n", userID)
			continue
		}
		UpdateStatusForRider(userID, "requested")
		log.Printf("Rider %s requested ride %s\n", userID, tripID)
		for GetTrip(tripID).Status != "accepted" {
			time.Sleep(100 * time.Millisecond)
		}
		UpdateStatusForRider(userID, "waiting")
		for GetTrip(tripID).Status != "en_route" {
			time.Sleep(100 * time.Millisecond)
		}
		UpdateStatusForRider(userID, "in_progress")
		for GetTrip(tripID).Status != "completed" {
			time.Sleep(100 * time.Millisecond)
		}
		log.Printf("Rider %s completed trip %s\n", userID, tripID)
	}
}

func GenerateRider(city string) model.Rider {
	lat, long := GenerateCoordinateInCity(city)
	rider := model.Rider{
		ID:          config.Faker.UUID().V4(),
		FirstName:   config.Faker.Person().FirstName(),
		LastName:    config.Faker.Person().LastName(),
		Email:       config.Faker.Internet().Email(),
		PhoneNumber: config.Faker.Phone().Number(),
		DateOfBirth: config.Faker.Time().TimeBetween(time.Now().AddDate(-30, 0, 0), time.Now()),
		CreatedAt:   time.Now(),
	}
	rider.LocationLat = lat
	rider.LocationLong = long
	rider.LocationCity = city
	rider.Status = "idle"
	return rider
}

func GenerateRiders(numRiders int, city string) []model.Rider {
	riders := make([]model.Rider, numRiders)
	for i := 0; i < numRiders; i++ {
		riders[i] = GenerateRider(city)
	}
	return riders
}

// ================================
//  LOCAL DATABASE FUNCTIONS
// ================================

func GetAllRiders() []model.Rider {
	riders := make([]model.Rider, 0)
	for _, rider := range database.Local.Riders.Items() {
		riders = append(riders, rider)
	}
	return riders
}

func GetRider(userID string) model.Rider {
	rider, ok := database.Local.Riders.Get(userID)
	if !ok {
		return model.Rider{}
	}
	return rider
}

func GetLocationForRider(userID string) (float64, float64) {
	rider := GetRider(userID)
	return rider.LocationLat, rider.LocationLong
}

func UpdateLocationForRider(userID string, lat float64, long float64) {
	rider := GetRider(userID)
	if rider.ID == "" {
		return
	}
	rider.LocationLat = lat
	rider.LocationLong = long
	database.Local.Riders.Set(userID, rider)
	exporter.KafkaProduceRider(rider)
}

func UpdateStatusForRider(userID string, status string) {
	rider := GetRider(userID)
	if rider.ID == "" {
		return
	}
	rider.Status = status
	database.Local.Riders.Set(userID, rider)
	exporter.KafkaProduceRider(rider)
}
