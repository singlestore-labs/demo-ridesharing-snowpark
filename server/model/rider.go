package model

import (
	"time"
)

// Rider represents a rider account in a ridesharing app
type Rider struct {
	ID           string    `json:"id"`
	FirstName    string    `json:"first_name"`
	LastName     string    `json:"last_name"`
	Email        string    `json:"email"`
	PhoneNumber  string    `json:"phone_number"`
	DateOfBirth  time.Time `json:"date_of_birth"`
	CreatedAt    time.Time `json:"created_at"`
	LocationCity string    `json:"location_city"`
	LocationLat  float64   `json:"location_lat"`
	LocationLong float64   `json:"location_long"`
	Status       string    `json:"status"`
}
