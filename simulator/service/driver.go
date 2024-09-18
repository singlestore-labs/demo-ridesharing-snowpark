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

func StartDriverLoop(userID string, city string) {
	initLat, initLong := GenerateCoordinateInCity(city)
	UpdateLocationForDriver(userID, initLat, initLong)
	for {
		UpdateStatusForDriver(userID, "idle")
		sleepTime := time.Duration(config.Faker.IntBetween(500, 2000)*getTimeMultiplier(city)) * time.Millisecond
		log.Printf("Driver %s is idle for %s\n", userID, sleepTime)
		time.Sleep(sleepTime)
		UpdateStatusForDriver(userID, "available")
		lat, long := GetLocationForDriver(userID)
		request := model.Trip{}
		accepted := false
		for !accepted {
			request = model.Trip{}
			for request.ID == "" {
				time.Sleep(100 * time.Millisecond)
				request = GetClosestRequest(lat, long)
			}
			accepted = TryAcceptRide(request.ID, userID)
		}
		UpdateStatusForDriver(userID, "in_progress")
		log.Printf("Driver %s accepted request %s\n", userID, request.ID)
		StartTripLoop(request.ID)
		log.Printf("Driver %s completed trip %s\n", userID, request.ID)
	}
}

func GenerateDriver(city string) model.Driver {
	lat, long := GenerateCoordinateInCity(city)
	driver := model.Driver{
		ID:          config.Faker.UUID().V4(),
		FirstName:   config.Faker.Person().FirstName(),
		LastName:    config.Faker.Person().LastName(),
		Email:       config.Faker.Internet().Email(),
		PhoneNumber: config.Faker.Phone().Number(),
		DateOfBirth: config.Faker.Time().TimeBetween(time.Now().AddDate(-30, 0, 0), time.Now()),
		CreatedAt:   time.Now(),
	}
	driver.LocationLat = lat
	driver.LocationLong = long
	driver.LocationCity = city
	driver.Status = "available"
	return driver
}

func GenerateDrivers(numDrivers int, city string) []model.Driver {
	drivers := make([]model.Driver, numDrivers)
	for i := 0; i < numDrivers; i++ {
		drivers[i] = GenerateDriver(city)
	}
	return drivers
}

// ================================
//  LOCAL DATABASE FUNCTIONS
// ================================

func GetAllDrivers() []model.Driver {
	drivers := make([]model.Driver, 0)
	for _, driver := range database.Local.Drivers.Items() {
		drivers = append(drivers, driver)
	}
	return drivers
}

func GetDriver(userID string) model.Driver {
	driver, ok := database.Local.Drivers.Get(userID)
	if !ok {
		return model.Driver{}
	}
	return driver
}

func GetLocationForDriver(userID string) (float64, float64) {
	driver := GetDriver(userID)
	return driver.LocationLat, driver.LocationLong
}

func UpdateLocationForDriver(userID string, lat float64, long float64) {
	driver := GetDriver(userID)
	if driver.ID == "" {
		return
	}
	driver.LocationLat = lat
	driver.LocationLong = long
	database.Local.Drivers.Set(userID, driver)
	exporter.KafkaProduceDriver(driver)
}

func UpdateStatusForDriver(userID string, status string) {
	driver := GetDriver(userID)
	if driver.ID == "" {
		return
	}
	driver.Status = status
	database.Local.Drivers.Set(userID, driver)
	exporter.KafkaProduceDriver(driver)
}
